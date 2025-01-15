// src/app/api/gtfs/route.ts
import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import Papa from 'papaparse';

const GTFS_STATIC_URL = process.env.NEXT_PUBLIC_GTFS_STATIC_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

interface GTFSRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
}

interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type: string;
  parent_station: string;
}

interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  direction_id: string;
  block_id: string;
  shape_id: string;
}

export async function GET() {
  try {
    if (!GTFS_STATIC_URL || !ACCESS_TOKEN) {
      console.error('GTFS URL or Access Token is missing');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // URLを構築
    const url = GTFS_STATIC_URL.replace('${NEXT_PUBLIC_ACCESS_TOKEN}', ACCESS_TOKEN);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GTFS API returned ${response.status}`);
      }

      // ZIPファイルのダウンロードと解析
      const zipBuffer = await response.arrayBuffer();
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipBuffer);

      // GTFSファイルの解析
      const parseFile = async (filename: string) => {
        const file = loadedZip.file(filename);
        if (!file) return [];
        
        const content = await file.async('text');
        return new Promise((resolve) => {
          Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error: any) => {
              console.error(`Error parsing ${filename}:`, error);
              resolve([]);
            }
          });
        });
      };

      // 各ファイルの並行解析
      const [routes, stops, trips] = await Promise.all([
        parseFile('routes.txt'),
        parseFile('stops.txt'),
        parseFile('trips.txt')
      ]);

      return NextResponse.json({
        routes,
        stops,
        trips
      });

    } catch (err) {
      console.error('Error fetching GTFS data:', err);
      return NextResponse.json(
        { error: 'Failed to fetch GTFS data', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in GTFS route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
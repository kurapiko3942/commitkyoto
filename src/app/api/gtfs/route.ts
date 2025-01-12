import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import Papa from 'papaparse';

export async function GET() {
  try {
    const staticUrl = process.env.NEXT_PUBLIC_GTFS_STATIC_URL;
    const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

    if (!staticUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(staticUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const zipBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    // Parse routes.txt
    const routesFile = await zip.file('routes.txt')?.async('string');
    const routes = routesFile ? Papa.parse(routesFile, {
      header: true,
      skipEmptyLines: true
    }).data : [];

    // Parse stops.txt
    const stopsFile = await zip.file('stops.txt')?.async('string');
    const stops = stopsFile ? Papa.parse(stopsFile, {
      header: true,
      skipEmptyLines: true
    }).data : [];

    // Parse trips.txt
    const tripsFile = await zip.file('trips.txt')?.async('string');
    const trips = tripsFile ? Papa.parse(tripsFile, {
      header: true,
      skipEmptyLines: true
    }).data : [];

    return NextResponse.json({ routes, stops, trips });
  } catch (error) {
    console.error('Static GTFS data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static GTFS data' },
      { status: 500 }
    );
  }
}
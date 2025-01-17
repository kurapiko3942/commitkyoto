/// src/app/api/gtfs/route.ts
import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { 
 GTFSRoute, 
 GTFSStop, 
 GTFSTrip, 
 GTFSStopTime, 
 GTFSFareAttribute, 
 GTFSFareRule 
} from '@/types/gtfsTypes';

const GTFS_STATIC_URL = process.env.NEXT_PUBLIC_GTFS_STATIC_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

export async function GET() {
 try {
   if (!GTFS_STATIC_URL || !ACCESS_TOKEN) {
     
     
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

     // GTFSファイルの解析関数の型を指定
     const parseFile = async <T>(filename: string): Promise<T[]> => {
       const file = loadedZip.file(filename);
       if (!file) {
         console.warn(`File ${filename} not found in ZIP`);
         return [];
       }
       
       const content = await file.async('text');
       return new Promise((resolve) => {
         Papa.parse(content, {
           header: true,
           dynamicTyping: true,
           skipEmptyLines: true,
           complete: (results) => resolve(results.data as T[]),
           error: (error: any) => {
         
             resolve([]);
           }
         });
       });
     };

     // 各ファイルを型付きで並行解析
     const [routes, stops, trips, stopTimes, fareAttributes, fareRules] = await Promise.all([
       parseFile<GTFSRoute>('routes.txt'),
       parseFile<GTFSStop>('stops.txt'),
       parseFile<GTFSTrip>('trips.txt'),
       parseFile<GTFSStopTime>('stop_times.txt'),
       parseFile<GTFSFareAttribute>('fare_attributes.txt'),
       parseFile<GTFSFareRule>('fare_rules.txt')
     ]);


     return NextResponse.json({
       routes,
       stops,
       trips,
       stopTimes,
       fareAttributes,
       fareRules
     });

   } catch (err) {
     console.error('Error fetching or parsing GTFS data:', err);
     return NextResponse.json(
       { error: 'Failed to fetch GTFS data', details: err instanceof Error ? err.message : 'Unknown error' },
       { status: 500 }
     );
   }

 } catch (error) {
  
   return NextResponse.json(
     { error: 'Internal server error' },
     { status: 500 }
   );
 }
}
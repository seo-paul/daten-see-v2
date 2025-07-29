/**
 * Debug Logs API Endpoint
 * Receives debug logs from browser and writes them to files that Claude can read
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const debugData = await request.json();
    
    // Create debug directory if it doesn't exist - use tmp for Docker compatibility
    const debugDir = join(process.cwd(), '.next', 'debug-output');
    if (!existsSync(debugDir)) {
      mkdirSync(debugDir, { recursive: true });
    }
    
    // Write current session data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-session-${timestamp}.json`;
    const filepath = join(debugDir, filename);
    
    // Enhanced debug data with server timestamp
    const enhancedData = {
      ...debugData,
      serverTimestamp: new Date().toISOString(),
      serverReceived: true
    };
    
    writeFileSync(filepath, JSON.stringify(enhancedData, null, 2));
    
    // Also write to a "latest" file that Claude can always read
    const latestPath = join(debugDir, 'latest-debug-session.json');
    writeFileSync(latestPath, JSON.stringify(enhancedData, null, 2));
    
    // Write a summary file for quick analysis
    const summaryPath = join(debugDir, 'debug-summary.json');
    const summary = {
      lastUpdated: new Date().toISOString(),
      sessionId: debugData.sessionId,
      totalLogs: debugData.logs?.length || 0,
      totalErrors: debugData.errors?.length || 0,
      widgetCount: debugData.currentState?.widgets || 0,
      deleteButtonCount: debugData.currentState?.deleteButtons || 0,
      editMode: debugData.currentState?.editMode || false,
      recentErrors: debugData.errors?.slice(-3) || [],
      recentLogs: debugData.logs?.slice(-5) || [],
      widgetAnalysis: debugData.widgetAnalysis || null
    };
    
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📄 Debug logs written to: ${filename}`);
    console.log(`📊 Summary: ${summary.totalLogs} logs, ${summary.totalErrors} errors, ${summary.widgetCount} widgets`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Debug logs received',
      filename,
      summary: summary
    });
    
  } catch (error) {
    console.error('Failed to process debug logs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process debug logs' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return current debug status
    const debugDir = join(process.cwd(), '.next', 'debug-output');
    const latestPath = join(debugDir, 'latest-debug-session.json');
    const summaryPath = join(debugDir, 'debug-summary.json');
    
    let latestSession = null;
    let summary = null;
    
    try {
      if (existsSync(latestPath)) {
        const latestData = require(latestPath);
        latestSession = latestData;
      }
      
      if (existsSync(summaryPath)) {
        const summaryData = require(summaryPath);
        summary = summaryData;
      }
    } catch (error) {
      console.warn('Failed to read debug files:', error);
    }
    
    return NextResponse.json({
      debugSystemActive: true,
      hasLatestSession: latestSession !== null,
      summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to get debug status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get debug status' 
    }, { status: 500 });
  }
}
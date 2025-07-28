import { exec } from 'child_process';
import { promisify } from 'util';

import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

/**
 * API Endpoint: Trigger Metrics Collection
 * Executes the collect-real-metrics.sh script and returns updated metrics
 */
export async function POST(): Promise<NextResponse> {
  try {
    // eslint-disable-next-line no-console
    console.log('🔄 Manual metrics collection triggered from dashboard');
    
    // Execute the metrics collection script
    const { stdout, stderr } = await execAsync('./scripts/collect-real-metrics.sh', {
      cwd: process.cwd(),
      timeout: 30000, // 30 second timeout
    });
    
    if (stderr) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Script stderr:', stderr);
    }
    
    // eslint-disable-next-line no-console
    console.log('✅ Metrics collection completed:', stdout.split('\n').slice(-6).join('\n'));
    
    return NextResponse.json({
      success: true,
      message: 'Metrics collection completed successfully',
      timestamp: new Date().toISOString(),
      output: stdout.split('\n').slice(-6), // Last 6 lines of output
    });
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to collect metrics:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to collect metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500
    });
  }
}

/**
 * Handle unsupported methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Method not allowed. Use POST to trigger metrics collection.',
  }, {
    status: 405
  });
}
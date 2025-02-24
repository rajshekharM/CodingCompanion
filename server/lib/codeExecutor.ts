import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const EXECUTION_TIMEOUT = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB
const TEMP_DIR = '/tmp/code-execution';

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export async function executeCode(code: string): Promise<ExecutionResult> {
  const start = Date.now();
  
  // Create unique file for this execution
  const fileId = randomBytes(16).toString('hex');
  const filePath = path.join(TEMP_DIR, `${fileId}.py`);
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    // Write code to file
    await fs.writeFile(filePath, code);
    
    return new Promise((resolve) => {
      const process = spawn('python3', [filePath], {
        timeout: EXECUTION_TIMEOUT,
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        if (stdout.length < MAX_BUFFER_SIZE) {
          stdout += data.toString();
        }
      });
      
      process.stderr.on('data', (data) => {
        if (stderr.length < MAX_BUFFER_SIZE) {
          stderr += data.toString();
        }
      });
      
      process.on('close', () => {
        const executionTime = Date.now() - start;
        
        // Clean up temp file
        fs.unlink(filePath).catch(console.error);
        
        resolve({
          output: stdout.trim(),
          error: stderr.trim() || null,
          executionTime,
        });
      });
      
      // Handle timeout
      setTimeout(() => {
        process.kill();
      }, EXECUTION_TIMEOUT);
    });
  } catch (error) {
    const executionTime = Date.now() - start;
    return {
      output: '',
      error: `Execution error: ${(error as Error).message}`,
      executionTime,
    };
  }
}

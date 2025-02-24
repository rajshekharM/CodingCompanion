import subprocess
import os
import signal
import sys
from concurrent.futures import ThreadPoolExecutor

def run_frontend():
    os.chdir("frontend")
    return subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def run_backend():
    os.chdir("backend")
    return subprocess.Popen(["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "5000"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def stream_output(process, prefix):
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            print(f"[{prefix}] {line.decode().strip()}")

def main():
    frontend = run_frontend()
    backend = run_backend()
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        executor.submit(stream_output, frontend, "Frontend")
        executor.submit(stream_output, backend, "Backend")
        
    def signal_handler(sig, frame):
        print("\nShutting down...")
        frontend.terminate()
        backend.terminate()
        sys.exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    
    frontend.wait()
    backend.wait()

if __name__ == "__main__":
    main()

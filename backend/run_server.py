import os
import sys
sys.path.append(os.path.dirname(__file__))

import uvicorn

if __name__ == "__main__":
    print("==================================================")
    print("STARTING KRISHISETU BACKEND FASTAPI SERVER")
    print("Swagger API Docs: http://127.0.0.1:8000/docs")
    print("Health check:     http://127.0.0.1:8000/health")
    print("==================================================")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# Font Identification Tool
## Environment setup
(For the environment setup, Anaconda has been used).

First, it is necessary to set up the environment for this service. The environment is required for the backend

1. Execute the file `environment.yml`

``` bash
conda env create -f environment.yml
```
This creates an environment named **document-clas**

2. Activate this environment
``` bash
conda activate document-clas
```

## Execution
From the `fontIdentificationTool` directory, execute:
``` bash
python server.py
```
Once the command is executed, the service will wait on port xxx until a recognition request is received.


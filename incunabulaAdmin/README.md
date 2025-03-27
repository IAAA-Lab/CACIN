# Administrator Web

## Environment Setup
(To configure the setting you should use anaconda).

First, it is necessary to configure the environment for this web. The environment is required for the backend.

1. Execute the file `environment.yml`

``` bash
conda env create -f environment.yml
```
This creates an environment named **reconocimiento-tipografias**

2. Execute the following command to activate the environment
``` bash
conda activate reconocimiento-tipografias
```

## Execution of the web
1. Launch the backend:
From the directory `incunabulaAdmin`
``` bash
python manage.py runserver xxxx
```

2. Start the frontend: 
From the directory `incunabulaAdmin/frontend`.
For this web, the required Node version is v16.0.0, so first, switch to this version
```bash
nvm use v16.0.0
```
Install the dependencies  and execute the web
```bash
npm install
npm start
```

# Configuration for the backend and database functionality
## Create the new environment
(Anaconda has been used for the environment setup).

First, configure this environment.
Use the 'environment.yml' file to create a new environment.
```bash
        conda env create -f environment.yml
```

## DB creation
1. Install postregsql:
 ``` bash
   pip install psycopg2-binary
```
2. Create a DB using commands

        1. Authenticate on the PostgreSQL server:
                psql postgres
        2. Generate the DB:
                CREATE DATABASE <NombreBD>;
        3. PTo verify if the database has been created, you can connect to it via the following command:
                \connect <NombreBD>;

3. Configure the DB in`settings.py` with the appropriate data:
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'dataName',
            'USER': 'user',
            'PASSWORD': 'password',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
    ```
4.  Create a .env file (it is included in the .gitignore so it is not uploaded to Git) where the DB connection details are stored.

## Creation of the tables in the DB
To create the tables in the database, you should execute the following commands.
```bash
python manage.py makemigrations
python manage.py migrate
```


## To populate the database with test data:
The population of data in the database depends on an RDF file.
To execute the file:

```bash
python fill_db.py <nameRDFFile>
```

Database connection values must also be configured.

# Test
Unit tests have been created, and they are located in the `incunabula/tests` directory.  There are two ways to run the tests: execute the entire stack or run them by model:
## Execution of the test stack
```bash
python manage.py test incunabula
```

## Tests for the model `User`
The `test_user.py`  script has been created for user testing.
```bash
python manage.py test incunabula.tests.test_user
```
## Test for the model `FontType`

The`test_font_type.py` script has been created for FontType testing
```bash
python manage.py test incunabula.tests.test_font_type
```

## Tests for the model `Book`
The `test_book.py` script has been created for Book testing
```bash
python manage.py test incunabula.tests.test_book
```

## Tests for the model `Office`
The `test_office.py` script has been created for Office testing
```bash
python manage.py test incunabula.tests.test_office
```

## Tests for model `Person`
The `test_person.py` script has been created for Person testing
```bash
python manage.py test incunabula.tests.test_person
```

# If you encounter the token issue
'str' object has no attribute 'decode'

In the file where this error occurs, change the line
**return token.decode('utf-8')**
to 
**return token**


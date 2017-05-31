# Log view documentation

## Importing a vehicle
### Get the INTERNAL api token
POST:

    http://bims-dev.northeurope.cloudapp.azure.com/api/integration/auths

Headers:    

    login devusername
    apikey BIMS

Result:

    {
        "result": {
            "token":"ZjgyNmQxZjVhYjNlZjViMTY1MzhiNmY3YzhkNWY0NjA1OWU4ZTMyMA=="
        },
        "_cursor": []
    }

### Sending vehicle data
POST:

    http://bims-dev.northeurope.cloudapp.azure.com/api/integration/imports/15

Headers:

    Authorization ZjgyNmQxZjVhYjNlZjViMTY1MzhiNmY3YzhkNWY0NjA1OWU4ZTMyMA==
    Content-Type application/json

Body Raw:

    {
        "vin": "VIN019638135",
        "thirdPartyID": "H_5431"
    }

Result:

    {
        "result": {
        "id": "57bff6d94b4f1209008b4567",
        "thirdPartyID": "H_5431",
        "vin": "VIN019638135"
        },
        "_cursor": []
    }
## Requesting Imports log

GET

    http://bims-dev.northeurope.cloudapp.azure.com/api/import/logs

    Authorization eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXUyJ9.eyJ1aWQiOiI1N2IzMGY2OGEwY2ViYzE4MDIwMDAwNGIiLCJqdGkiOiJhNjk2MTQ4Njk1NmM0OWEwYThlMjEwOWFmNzcxM2I2ZmQxMDE4ODRiMzZjNGEwNTE2NWE5YzdjOTQ1ODk3YWMwIiwiaWF0IjoiMTQ3MTM1OTAyOCJ9.Pbhsz4hbNl13XMFFiPeQieDXjM04gUfJ7R4B8fIM2jc

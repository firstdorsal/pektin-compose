# Concept

handled in vault:

-   creation of new entities

handled in opa:
is entity allowed to use the api for:

-   domain
-   apiMethods
-   rrTypes
-   valuePatterns

# Problems that make this complicated

vault cant decide custom policy decissions:

-   is someone allowed to set a record for some domain

vaults transit signing engine cannot decide if it should sign what it receives

# What we want

client should not have access to the signing engine

api should not have permanent access to every domains signing engine

domain-admin clients could be allowed to have access to their signing engines but a
acme-client would possibly need to have access to sign for every domain through the api
but vaults transit engine cant know what it is that it should sign

# Example

## Existing domains:

y.gy.
pektin.xyz.

## Existing vault entities:

### signers

a signing account exists for every domain

username: pektin-signer-y.gy.
password: 123456
can sign anything sent with the key for its domain using vaults transit engine

username: pektin-signer-pektin.xyz.
password: password
can sign anything sent with the key for its domain using vaults transit engine

### api

the api has access to the second half of every signer's password.

vault:pektin-api
password: any
access to KV pektin-signer

pektin-signer:

```json
{
    "y.gy.": "456",
    "pektin.xyz.": "word"
}
```

### clients

The client has access to the first half of the signer password for every domain it needs access to.

#### acme-client

has access to a kv store with the first half of the passwords needed to sign records for the domains

metadata:pektin-policy:

```rego
package system.main
import future.keywords.in

default domain = false
default apiMethods = false
default rrTypes = false
default valuePatterns = false


domain {
    startswith(input.domain,"_acme-challenge.")
    endswith(input.domain,".")
}

apiMethods {
    input.apiMethods in ["set","get","delete"]
}

rrTypes {
    input.rrTypes in ["TXT"]
}

valuePatterns {
    true
}


```

## api request

1. the client logs in with vault and receives a access token for its username/password
2. the client sends its vault access token (not username and password!) with the dns-api-query to the api endpoint

3. The api takes the client token and requests the client's metadata from vault
4. the api queries vault for the pektin-signer KV store with its own access token to get the second half of the access password for the signing entity
5. the api queries opa for evaluation of the query with the policy received with the metadata from step 3.
6. If the query is allowed the api queries vault to sign the record; it logs into the signing account for the domain with the full password
7. after the query is executed the api "forgets" all passwords to not have any secrets at rest

## create a client

create an entity with username password auth
in the metadata fields set the field pektin-policy to the applicable rego policy
per default it can access its own metadata

# structure

pektin-entity

```ts
interface PektinEntity {
    name: String;
    type: PektinEntityType;
    vaultAccess: PektinSecretEngine[];
    password: String;
}

type PektinSecretEngine = HalfPassword | Signer;

interface HalfPassword {
    name: String;
    type: "kv";
}

interface Signer {
    name: String;
    type: "transit";
}

type PektinEntityType = "client" | "api" | "signer";

type VaultSecretEngineType = "transit" | "kv";

type PektinApiPolicy = String; // the contents of a rego file
```

acme-client:
client:
pektin-api-policy: acme.rego
signing-access: - "\*"

signer-y.gy.:
signer:
transit: y.gy.
password: 123456

signer-pektin.xyz.:
signer:
transit: pektin.xyz.
password: 123456

```

```

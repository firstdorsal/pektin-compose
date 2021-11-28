# entity metadata

https://play.openpolicyagent.org/

https://www.openpolicyagent.org/docs/latest/policy-language/#the-basics

## example

/domains/apiMethod/rrType/valuePattern

# serverAdmin

access:

```
/*/*/*/*
```

```json
[{ "domains": ["*"], "apiMethods": ["*"], "rrTypes": ["*"], "valuePatterns": ["*"] }]
```

```rego
package play

default domain = true
default apiMethods = true
default rrTypes = true
default valuePatterns = true
```

# domainAdmin

access to one or many domains without method,type or pattern constraints

for one domain

```
/pektin.xyz.,*.pektin.xyz./*/*/*
```

for two domains

```
/pektin.xyz.,*.pektin.xyz.,pektin.club.,*.pektin.club./*/*/*
```

```json
[
    {
        "domains": ["pektin.xyz.", "*.pektin.xyz.", "pektin.club.", "*.pektin.club."],
        "apiMethods": ["*"],
        "rrTypes": ["*"],
        "valuePatterns": ["*"]
    }
]
```

or the same

```
/pektin.xyz.,*.pektin.xyz./*/*/*,
/pektin.club.,*.pektin.club./*/*/*
```

```json
[
    {
        "domains": ["pektin.xyz.", "*.pektin.xyz."],
        "apiMethods": ["*"],
        "rrTypes": ["*"],
        "valuePatterns": ["*"]
    },
    {
        "domains": ["pektin.club.", "*.pektin.club."],
        "apiMethods": ["*"],
        "rrTypes": ["*"],
        "valuePatterns": ["*"]
    }
]
```

```rego
package play

default domain = false
default apiMethods = false
default rrTypes = false
default valuePatterns = false


domain {
    domain:=input.domain
    endswith(domain,["pektin.xyz.","pektin.club."][i])
}

apiMethods {
    true
}

rrTypes {
    true
}

valuePatterns {
    true
}
```

# acmeClient

can set \_acme-challenge records for all domains
can use set get delete methods
can use methods with type TXT
can use any pattern

```
/_acme-challenge.*/set,get,delete/TXT/*
```

```json
[
    {
        "domains": ["_acme-challenge.*"],
        "apiMethods": ["set", "get", "delete"],
        "rrTypes": ["TXT"],
        "valuePatterns": ["*"]
    }
]
```

```rego
package play
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

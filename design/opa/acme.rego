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


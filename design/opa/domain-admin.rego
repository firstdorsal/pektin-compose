package system.main

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
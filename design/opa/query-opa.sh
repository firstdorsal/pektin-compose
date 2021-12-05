curl http://[::]:8081/v1/policies/x -X "PUT" -v -H "Content-Type: text/plain" --data-binary @acme.rego

curl http://[::]:8081/ -X "POST" -v -H "Content-Type: application/json" --data-binary @input.json

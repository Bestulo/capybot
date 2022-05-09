# Instrucciones

## token
Pon tu bot token en un json así

`{ "token": "TU TOKEN" }`

si no sabes conseguir el bot token gugléalo, es fácil, es simplemente app dashboard -> a la izuqierda pones "bot" y luego copias el token

luego guarda el json como `secrets.json` en el mismo directorio que `capy.js`

## instalar
tienes que tener nodejs, npm, yarn y pm2, si no sabes como instalarlos gugléalo, es muy fácil y toma 1 minuto o 2

```
yarn
pm2 start capy.js
```

## matar

```
pm2 stop capy
```

import http from "node:http";

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    res.end(
        JSON.stringify({
            message: "Cubika API funcionando",
        })
    );
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Cubika API ejecutándose en puerto ${PORT}`);
});
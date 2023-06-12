import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {
    const { id, title, genre_id, language_id, oscar_count, release_date } =
        req.body;
    try {
        const movieWithTheSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
            },
        });

        if (movieWithTheSameTitle) {
            return res.status(409).send({
                message: "Já exist um filme cadastrado com esse titulo.",
            });
        }

        await prisma.movie.create({
            data: {
                id,
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ message: "falha ao cadastrar" });
    }

    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: "filme não encontrado" });
        }

        const data = { ...req.body };

        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;

        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });
    } catch (error) {
        res.status(500).send({ message: "Falha na atulização" });
    }

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});

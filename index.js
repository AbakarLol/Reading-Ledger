import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";
import { title } from "process";
import { read, write } from "fs";
import { user } from "./store.js";


const app = express();
const port = 3000;

/* Using midlleware to parse and set static files */

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

/* Create a new client, seting paramters for connection */
const db = new pg.Client({
    user : user.user,
    host : "localhost",
    database : "notebook",
    password : user.password ,
    port : 5432
});

db.connect();

let reviews = []

/* get the books reviews and information soting it by rate */

async function getBooksByRate(){
    const result = await db.query("SELECT b.id as id, title, authors, rate, isbn,  read_date, overview from books b join reviews r on b.id = r.id order by rate ASC; ");
    return result.rows
}

/* get the books reviews and information soting it by date */

async function getBooksByDate(){
    const result = await db.query("SELECT b.id as id, title, authors, rate, isbn,  read_date, overview from books b join reviews r on b.id = r.id order by read_date ASC; ");
    return result.rows
}

/* get the books reviews and information soting it by title */

async function getBooksByTitle(){
    const result = await db.query("SELECT b.id as id, title, authors, rate, isbn,  read_date, overview from books b join reviews r on b.id = r.id order by title ASC; ");
    return result.rows
}

/* set reviews sorted by rate */

reviews = await getBooksByRate();

/* get the first page with reviews sorted by rate  */

app.get("/", async (req, res) => {
    res.render("index.ejs", 
      {data : reviews}  
    );
});

/* get note for selected book by its id  */

app.get("/note/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT b.id as id, title, authors, rate, isbn, read_date, overview, note from books b join reviews r on b.id = r.id where b.id = $1 ;", [id]);
    const reviews = result.rows[0];
    res.render("note.ejs", 
      {data : reviews}  
    );
});

/* adding sort features with the 3 options  */

app.post("/sort", async (req, res) => {
    const type = req.body.sort;
    if (type === 'date') {
        reviews = await getBooksByDate();
    }else if (type === 'title'){
        reviews = await getBooksByTitle();
    }else{
        reviews = await getBooksByRate();
    }
    res.redirect("/");
});

/* render write page for new reviews */

app.post("/write", (req, res) => {
    res.render("write.ejs");
});

/* render editing page for the selected review */

app.post("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const result = await db.query("SELECT b.id as id, title, authors, rate, isbn, read_date, overview, note from books b join reviews r on b.id = r.id where b.id = $1 ;", [id]);
        const reviews = result.rows[0];
        res.render("write.ejs", {data : reviews});

    }catch(err){
        console.log(err.stack);
        res.render("write.ejs");
    }
    
});

/* to delete the selected reviews where id passed as request parameter */

app.post("/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        await db.query("DELETE FROM reviews where id = $1", [id]);
        try{
        await db.query("DELETE FROM books where id = $1", [id]);
        reviews = await getBooksByRate();
        res.redirect("/");
        }catch(err){
            console.log(err.stack)
            res.redirect("/");
        }
        
    }catch(err){
        console.log(err.stack)
        res.redirect("/");
    }
})

/* to submit modification for existing review  */

app.post("/modify/:id" , async (req, res) => {
    const id = parseInt(req.params.id);
    const book  = {
        title : req.body.title,
        authors : req.body.authors,
        isbn : req.body.isbn
    };
    const review = {
        id : parseInt(req.params.id),
        read_date : req.body.read_date,
        rate : req.body.rate,
        overview : req.body.overview,
        note : req.body.note
    }

    try{
        const result1 = await db.query("update books set title = $1, authors = $2, isbn = $3 where id = $4 ", [book.title, book.authors, book.isbn, id]);
        try{
        const result2 = await db.query("update reviews set read_date = $2, rate = $3, overview = $4, note = $5 where id = $1 ", [review.id, review.read_date, review.rate, review.overview, review.note]);
        reviews = await getBooksByRate();
        res.redirect("/");
        }catch(err){
            console.log(err.stack);
            res.redirect(`/edit/:${id}`)
        }
    }catch(err){
        console.log(err.stack);
        res.redirect(`/edit/:${id}`)
    }
});

/* to submit modification for new review  */

app.post("/modify", async (req, res) => {
    const book  = {
        title : req.body.title,
        authors : req.body.authors,
        isbn : req.body.isbn
    };
    const review = {
        id : parseInt(req.params.id),
        read_date : req.body.read_date,
        rate : req.body.rate,
        overview : req.body.overview,
        note : req.body.note
    }
    try{
        const result1 = await db.query("INSERT INTO books (title, authors, isbn) VALUES ($1, $2, $3) RETURNING *", [book.title, book.authors, book.isbn]);
        const newBook = result1.rows[0];
        try{
            const result2 = await db.query("INSERT INTO reviews VALUES ($1, $2, $3, $4, $5);", [newBook.id, review.read_date, review.rate, review.overview, review.note] );
            reviews = getBooksByRate();
            res.redirect("/")
        }catch(err){
            console.log(err);
            res.redirect("/");
        }
    }catch(err){
        console.log(err);
        res.redirect("/");
    }
})



app.listen(port, () => {
    console.log(`Server is Running on port : ${port}`);
});
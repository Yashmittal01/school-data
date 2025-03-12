const express= require("express");
const app= express();
app.use(express.json());
const mysql= require("./db");
const getDistance= require("./calDistance");
const createTable= 
`CREATE TABLE IF NOT EXISTS SchoolData(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
)`;
mysql.query(createTable,(err,res)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("table created"+res);
    }
});


app.post("/addSchool",(req,res)=>{
    const {name, address, latitude, longitude}= req.body;
    const dataQuery= `INSERT INTO schooldata(name, address, latitude, longitude) VALUES (?,?,?,?)`;
    mysql.query(dataQuery,[name, address,latitude,longitude],(err,result)=>{
        if(err){
            console.log(err);
            return res.status(500).json({error: "db error" });
        }
        else{
            return res.status(201).json({message: "school added", schoolID: result.insertId});
        }
    });

});

app.get("/listSchools", (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const query = "SELECT id, name, address, latitude, longitude FROM schooldata";
    mysql.query(query, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);

        const sortedSchools = results.map(school => ({
            ...school,
            distance: getDistance(userLat, userLon, parseFloat(school.latitude), parseFloat(school.longitude))
        })).sort((a, b) => a.distance - b.distance);

        res.status(200).json({ schools: sortedSchools });
    });
});


app.listen(5000,()=>{
    console.log("running on server 5000");
});
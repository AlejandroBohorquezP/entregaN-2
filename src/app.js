const express = require('express')
var session = require('express-session');
const app = express()
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');
const flash = require('connect-flash')
const bodyParser = require ('body-parser');
require('./helpers');

const directoriopublico = path.join(__dirname,'../public');
const directoriopartials = path.join(__dirname,'../partials');
const dirNode_modules = path.join(__dirname , '../node_modules')

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));


app.use(express.static(directoriopublico));

app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));

app.use(flash());

app.use(function(req, res, next){
    res.locals.mensajeSuccess = req.flash('success');
    res.locals.mensajeError = req.flash('error');
    next();
});

hbs.registerPartials(directoriopartials);

app.use(bodyParser.urlencoded({extended: false}))

app.set('view engine', 'hbs');

/* ----------------------------------------------------------------------*/



app.get('/', (req, res) =>{
    res.render('crearCursos', {
        titulocC: 'INSCRIPCIÓN DE CURSOS'
    });
})


app.get('/verCursos', (req, res) =>{
    let cursos = fs.readFileSync('src/listados/cursos.json');

    res.render('verCursos', {
        titulovC: 'VISUALIZACIÓN DE CURSOS',
        cursos: JSON.parse(cursos)
    });
})



app.get('/inscribirEstu', (req, res) =>{
    let cursos = fs.readFileSync('src/listados/cursos.json');

    res.render('inscribirEstu', {
        tituloiE: 'INSCRIPCIÓN DE ESTUDIANTES',
        cursos: JSON.parse(cursos)
})
})

app.get('/verEstuporCurso', (req, res) =>{
    let estudiantes = fs.readFileSync('src/listados/estudiantes.json');
    
    res.render('verEstuporCurso', {
        titulovE: 'VISUALIZACIÓN DE ESTUDIANTES',
        estudiantes: JSON.parse(estudiantes),
        nombreCurso: "Todos los cursos"
    });
  });

/* ----------------------------------------------------------------------*/
 


app.post('/crearCursos',(req, res, next) =>{
    let cursos = require('./listados/cursos.json');

    let curso = { 
        idCurso: parseInt(req.body.idCurso),
        nombreCurso: req.body.nombreCurso,
        descripcion: req.body.descripcion,
        valor: parseInt(req.body.valor),
        intensidad: req.body.intensidad,
        modalidad: req.body.modalidad
    };

    // Validaciones
    if (cursos.filter(element => element.idCurso === parseInt(req.body.idCurso)).length > 0) {
        req.flash('error', 'Ya hay un curso creado con el id ' + req.body.idCurso);
        res.redirect('/crearCursos');
        return;
    }

    cursos.push(curso);
     
    let data = JSON.stringify(cursos, null, 2);
    
    fs.writeFile('src/listados/cursos.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    req.flash('success', 'Se creó correctamente el curso ' + req.body.nombreCurso);
    res.redirect('/crearCursos');
});

app.post('/eliminarCurso',(req, res, next) =>{
    let cursos = require('./listados/cursos.json');

    // Logica para eliminar
    cursos = cursos.filter(element => element.idCurso !== parseInt(req.body.idCurso));

    let data = JSON.stringify(cursos, null, 2);
    
    fs.writeFile('src/listados/cursos.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    res.redirect('/verCursos');
});

app.post('/inscribirEstu',(req, res, next) =>{
    let estudiantes = require('./listados/estudiantes.json');

    let estudiante = {
        nombreEstudiante: req.body.nombreEstudiante,
        idEstudiante: parseInt(req.body.idEstudiante),
        telefono: parseInt(req.body.telefono),
        correo: req.body.correo,
        documento: req.body.documento,
        idCurso: parseInt(req.body.idCurso)

    }

     if (estudiantes.filter(element => element.idEstudiante === parseInt(req.body.idEstudiante)).length > 0) {
        req.flash('error', 'Ya hay un estudiante inscrito con ese número de documento ' + req.body.idEstudiante);
        res.redirect('/crearCursos');
        return;
    } 

    estudiantes.push(estudiante);
    
        let data = JSON.stringify(estudiantes, null, 2);
        
            fs.writeFile('src/listados/estudiantes.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });

        req.flash('success', 'Se registró correctamente el estudiante ' + req.body.nombreCurso + "Con la ("+req.body.documento+") :" + req.body.idEstudiante );
        res.render('verEstuporCurso', {
            titulovE: 'VISUALIZACIÓN DE ESTUDIANTES',
            estudiantes: estudiantes,
            nombreCurso: "Todos los cursos"
        });
});


app.post('/verEstuporCurso', (req, res) =>{
    var estudiantes = require('./listados/estudiantes.json');

    estudiantes = estudiantes.filter(element => element.idCurso === parseInt(req.body.idCurso2));

    res.render('verEstuporCurso', {
        titulovC: 'VISUALIZACIÓN DE ESTUDIANTES POR CURSO',
        estudiantes: estudiantes,
        nombreCurso: req.body.nombreCurso
    });
})



app.get('*',(req, res) =>{
    res.render('error',{
    estudiante: 'error'
    })
}) 

console.log(__dirname)


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Se está escuchando en el puerto 3000'+ port)
});




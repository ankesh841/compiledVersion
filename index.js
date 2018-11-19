// Express {
var express = require('express');
const app = express();
const PORT = 3000;

var bodyParser = require('body-parser');    //to get the object from the url 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = require('path');
app.use(express.static(path.join(__dirname, './dist')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.all("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyA77CMnccmWSuX-cgzFkT8RjPRQbeJJ25k",
    authDomain: "bookstore2july24.firebaseapp.com",
    databaseURL: "https://bookstore2july24.firebaseio.com",
    projectId: "bookstore2july24",
    storageBucket: "bookstore2july24.appspot.com",
    messagingSenderId: "581038020415"
};
firebase.initializeApp(config);

// email
var nodemailer = require('nodemailer');

//url for sending emails.
app.post('/mail2', (req, res) => {

    let data = req.body;
    let bookname = data.bookname;
    let course = data.course;
    let dep = data.department;
    var userEmail = data.email;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
            user: 'possiblecreations.ankesh@gmail.com',
            pass: 'great@creations2'
        }
    });
    var mailList = [userEmail, 'ankeshgupta148@gmail.com'];
    var mailOptions = {
        from: 'possiblecreations.ankesh@gmail.com',
        to: mailList,
        subject: 'Order confirmation of your book: ' + bookname,
        html: `        
        <html>
  <head/>
  <body>
    <div style="background-color:#e9ecef" style="width:100%">
  <div style="width: 80%; margin:10%; text-align: center !important;display: block; border-radius: 0.3rem">
        <div  style="margin-top: -20px;display: block;margin-bottom: 2rem;background-color: #e9ecef;border-radius: 0.3rem">
            <img  src="cid:logopicture" height="200" width="200" style="text-align: center !important;max-width: 100%;height: auto;vertical-align: middle;border-style: none"/>
            <div style="background-color: white;padding: 45px 60px 60px 60px;display: block">
                <p style="font-size: 1.3em">Thank you! </p>
                <br>
                You have ordered ` + bookname + `<br> Department: ` + dep + `<br> CourseNumber: ` + course + `
                <br>
                <br>
            We will call you as soon as possible to FINALIZE the meeting place at
                    Langara College
            </div>

            <br/>
        </div>


    </div>


</div>
</body>
</html>`
        ,
        attachments: [{
            filename: 'booksnation_logo.png',
            path: 'booksnation_logo.png',
            cid: 'logopicture'
        }]


    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.sendStatus(200);
    });
});


/**getting all departments for login panel
 */
//////////////////////////////////
app.get(`/departmentsAbr`, (req, res) => {
    res.send(abbrevArr_department);
});
////////////////////////////////////


/**getting all abrevation for login panel
  */
/////////////////////////////
var abbrevArr_department = [];
var getAllAbbreviations = new Promise((resolve, reject) => {
    var temp = firebase.database().ref("departments").orderByChild('abrev');
    temp.on('child_added', function (snap) {
        var course_number = snap.val().coursenumber;
        if (abbrevArr_department[abbrevArr_department.length - 1] != snap.val().abrev) {
            abbrevArr_department.push(snap.val().abrev);
        }
    });

});

///////////////////////////////////////////
/**getting department name from submitted books. 
 */
var department_name_sub_ = [];
function department_name_sub() {
    department_name_sub_ = [];
    var ref = firebase.database().ref("submittedBookss");
    ref.on('child_added', function (snap) {
        department_name_sub_.push(snap.val().department);
    });
    return department_name_sub_;
}

department_name_sub();
app.get(`/depSub`, async (req, res) => {
    department_name_sub();
    var b = Array.from(new Set(department_name_sub()));
    res.send(b);
});
//////////////////////////////////////////////

///login panel
//getting coursenumbers from abrevations.
app.get(`/coursenums/:ofAbrev`, (req, res) => {
    let course = req.params.ofAbrev.toUpperCase();
    var cNum = [];
    var db = firebase.database().ref("departments").equalTo(course).orderByChild("abrev");
    db.once('value')
        .then(snapshot => {
            snapshot.forEach(e => {
                cNum.push(e.val().coursenumber);
            });
            res.send(cNum);
        });
});

///////////////////////////////////////////////////////////
//for gettting only the submitted books abbrevation:
var cNum_submittedBooks = [];
function abbrsub(course) {
    cNum_submittedBooks = [];
    var ref___ = firebase.database().ref("submittedBookss");
    ref___
        .equalTo(course)
        .orderByChild("department")
        .on("child_added", function (snap) {
            cNum_submittedBooks.push(snap.val().course);
        });
}
app.get('/abbrsub/:ofAbrev', (req, res) => {
    let course = req.params.ofAbrev.toUpperCase();
    abbrsub(course);
    res.send(cNum_submittedBooks);
});
/////////////////////////////////////////////////////////


/**sending booktitle.*/
app.get('/booktitle/:abr/:num', (req, res) => {
    let course = req.params.abr.toUpperCase();
    let num = req.params.num;
    let bookName = [];
    var db = firebase.database().ref("departments").equalTo(course).orderByChild("abrev");
    //course = ahis
    //
    db.once('value').then(snapshot => {
        snapshot.forEach(e => {
            if (e.val().coursenumber === num) {
                bookName.push(e.val().booktitle);
            }
        });
        res.json([{
            "book": bookName
        }]);
    });
});


app.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`)
);
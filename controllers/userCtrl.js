
const connection = require("../dbConfig");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//const bodyParser = require("body-parser");

const userCtrl = {
    getUser : async (req, res) => {
        connection.query('select * from user', (error, rows) => {
            if(error) throw error;
            res.send(rows);
        })
    },

    accessToken : async (req, res) => {
        // 사용자 특정(로그인 후 postman Header에 Authorization : Bearer 토큰담아서 보내면됨)
        try{
            const token = req.cookies.accessToken;
            const data = jwt.verify(token, process.env.ACCESS_SECRET);
            //console.log(data.username);

            const query = "select * from user where id='" + data.username +"';";
            connection.query(query, function(err, rows) {
                if(rows.length == 0) { res.status(500).json("유저 특정 실패")}
                else {
                    console.log(rows[0].id); // park 나옴
                    res.status(200).json(rows[0]);
                }
                
            })
        }catch(error) {
            res.status(500).json(error);
        }
    },

    refreshToken : async (req, res) => {
        //accessToken 갱신 용도(5m) 이기 때문에
        try{
            const token = req.cookies.refreshToken;
            const data = jwt.verify(token, process.env.REFRESH_SECRET);
            const query = "select * from user where id='" + data.username +"';";
            connection.query(query, function(err, rows) {
                if(rows.length == 0) { res.status(500).json("refresh token 발급 실패")}
                else {
                    const accessToken = jwt.sign({
                        username : rows[0].id,
                        password : rows[0].password,

                    }, process.env.ACCESS_SECRET, {
                        expiresIn : '5m',
                        issuer : 'Park',
                    });
                    res.cookie("accessToken", accessToken, {
                        secure : false,
                        httpOnly : true,
                    });
                    res.status(200).json("Access Token 재발급 성공");
                }
                
            })
        }catch(error) {
            res.status(500).json(error);
        }

    },

    loginSuccess : async (req, res) => {
        // 로그아웃 버튼 활성화 
        try {
            const token = req.cookies.accessToken;
            const data = jwt.verify(token, process.env.ACCESS_SECRET);
            const query = "select * from user where id='" + data.username +"';";
            connection.query(query, function(err, rows) {
                if(rows.length == 0) { res.status(500).json("유저 특정 실패")}
                else {
                    console.log(rows[0].id); // park 나옴
                    res.status(200).json(rows[0]);
                }
                
            })
        }catch(error) {
            res.status(500).json(error);
        }
    },

    logout : async (req, res) => {
        // 토큰 삭제
        try{
            res.cookie('accessToken', '');
            res.status(200).json("로그아웃 성공");
        }catch(error) {
            res.status(500).json(error);
        }
    },

    makeUser : async (req, res) => {
        const id = req.body.id;
        const password = req.body.password;
        const hashPassword = crypto.createHash('sha512').update(password).digest('hex');
        const query = "select id from user where id='" + id +"';";
        connection.query(query, function(err, rows) {
            if(rows.length == 0) {
                var sql = {
                    id : id,
                    password : hashPassword
                    //salt : salt
                };
                const query = connection.query('insert into user set ?', sql, function(err, rows) {
                    if(err) throw err;
                    else {
                        res.send("회원가입 성공");
                    }
                });
            } else {
                res.send("중복 ID");
            }
        });

    },
    makeLogin : async (req, res, next) => {
        const id = req.body.id; // increment userid가 아니라 id 컬럼
        const password = req.body.password;
        //console.log(id, password);
        
        const query = "select password from user where id='" + id + "';";
        

        connection.query(query, function(err, rows) {
            //console.log(rows);
            if(err) throw err;
            else {
                if(rows.length == 0) {
                    console.log("아이디 틀림");
                    res.send("아이디 틀림");
                } else {
                    //const salt = rows[0].salt;
                    const pw = rows[0].password;
                    const hashPassword = crypto.createHash('sha512').update(password).digest('hex');
                    if(pw === hashPassword) {
                        console.log("로그인 성공");
                        console.log(id);
                        try {
                            // accesstoken 발급
                            const accessToken = jwt.sign({
                                username : id,
                                password : pw,

                            }, process.env.ACCESS_SECRET, {
                                expiresIn : '5m',
                                issuer : 'Park',
                            });
                            //refreshtoken 발급

                            const refreshToken = jwt.sign({
                                username : id,
                                password : pw,
                            }, process.env.REFRESH_SECRET, {
                                expiresIn : '24h',
                                issuer : 'Park',
                            })
                            
                            // accessToken 과 refreshToken을 쿠키에 담아서 클라이언트에 보냄. 클라이언트에서 요청할 때 token을 담아서 요청
                            res.cookie("accessToken", accessToken, {
                                secure : false,
                                httpOnly : true,
                            })
                            res.cookie("refreshToken", refreshToken, {
                                secure : false,
                                httpOnly : true,
                            })

                            res.status(200).json("로그인 성공");

                        }catch(error) {
                            res.status(500).json(error);
                        }
                        
                        
                    } else {
                        console.log("로그인 실패");
                        res.send("로그인 실패");
                    }
                 }
            }
        })
    }
}

module.exports = userCtrl;



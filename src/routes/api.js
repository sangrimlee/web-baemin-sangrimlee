const express = require('express');
const { createUUID } = require('../lib/uuid');
const { createSession } = require('../db/session');
const { createUser, isEmailExist, signInUser } = require('../db/user');

const router = express.Router();

router.post('/sign-up', (req, res) => {
  const { email, nickname, password, birthday } = req.body;

  isEmailExist(email, (isEmailExistError, user) => {
    if (isEmailExistError) {
      res.status(500).json({
        ok: false,
        errorMessage: isEmailExistError.message,
      });
    } else if (user) {
      res.status(400).json({
        ok: false,
        errorMessage: '이미 존재하는 이메일 계정입니다.',
      });
    } else {
      createUser(email, nickname, password, birthday, (createUserError) => {
        if (createUserError) {
          res.status(500).json({
            ok: false,
            errorMessage: createUserError.message,
          });
        } else {
          res.status(201).json({
            ok: true,
          });
        }
      });
    }
  });
});

router.post('/sign-in', (req, res) => {
  const { email, password } = req.body;

  signInUser(email, password, (signInUserError, user) => {
    if (signInUserError) {
      res.status(500).json({
        ok: false,
        errorMessage: signInUserError.message,
      });
    } else if (!user) {
      res.status(404).json({
        ok: false,
        errorMessage: '해당하는 로그인 정보를 찾을 수 없습니다.',
      });
    } else {
      const sid = createUUID();
      createSession(user.id, sid, (createSessionError) => {
        if (createSessionError) {
          res.status(500).json({
            ok: false,
            errorMessage: createSessionError.message,
          });
        } else {
          res
            .status(201)
            .cookie('sid', sid, { maxAge: 60 * 60 * 24 * 30, httpOnly: true })
            .json({
              ok: true,
            });
        }
      });
    }
  });
});

module.exports = router;

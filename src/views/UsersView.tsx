import React, { useEffect, useState } from 'react';
import * as API from 'aws-amplify/api';
import * as Auth from 'aws-amplify/auth';

const UsersView = () => {
  const [publicData, setPublicData] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(null);
  const fetchPublicData = async () => {
    const response = await (
      await API.get({
        apiName: 'public',
        path: '/test',
        options: { queryParams: { id: 'testQueryParam' } },
      }).response
    ).body.json();
    setPublicData(response);
  };
  const fetchAuthData = async () => {
    const response = await (
      await API.post({
        apiName: 'auth',
        path: '/authTest',
        options: { body: { id: 'testBody' } },
      }).response
    ).body.json();
    setAuthData(response);
  };

  const login = async () => {
    const email = prompt('Email?');
    const password = prompt('Password?');
    await Auth.signIn({ username: email, password: password });
    setLoggedIn(true);
  };

  const logout = async () => {
    await Auth.signOut();
    setLoggedIn(false);
  };
  const sleep = async (ms) =>
    await new Promise((resolve) => setTimeout(resolve, ms));
  const signup = async () => {
    const name = prompt('Name?');
    const email = prompt('Email?');
    const password = prompt('Password?');
    await Auth.signUp({
      username: crypto.randomUUID(),
      password: password,
      options: {
        userAttributes: {
          email: email,
          name: name,
        },
        autoSignIn: { enabled: true },
      },
    });
    await sleep(500);
    await Auth.autoSignIn();
    setLoggedIn(true);
  };

  useEffect(() => {
    const async = async () => {
      const attributes = (await Auth.fetchAuthSession()).tokens?.idToken
        ?.payload;
      if (!attributes) {
        setLoggedIn(false);
      } else {
        console.log(attributes);
        setLoggedIn(true);
      }
    };
    async();
  }, []);

  return (
    <>
      {/*
      Title: Users
      Button: Add New User - opens dialogue box
      Table
        fields: Name(?), email, role
    */}
      <h1>Users</h1>
      <button onClick={fetchPublicData}>Get public data</button>
      <div>{JSON.stringify({ publicData })}</div>
      <button onClick={fetchAuthData}>Get auth data</button>
      <div>{JSON.stringify({ authData })}</div>
      <button onClick={login}>Log In</button>
      <button onClick={logout}>Log Out</button>
      <button onClick={signup}>Sign Up</button>
      <div>{JSON.stringify({ loggedIn })}</div>
    </>
  );
};

export default UsersView;

import { useState } from 'react';
import { createFileRoute } from "@tanstack/react-router";

import * as API from "aws-amplify/api";

import { Button, Form } from 'react-bootstrap';

export const Route = createFileRoute("/add-service")({
  component: AddServiceView,
});

function AddServiceView() {

  const [newServiceName, setNewServiceName] = useState("")
  const [optionalQuota, setOptionalQuota] = useState("")

  const handleCreateNewService = async () => {
    // send new service name and quota to api
    const response = await (
      await API.post({
        apiName: "auth",
        path: "/addService",
        options: {
          body: {
            name: newServiceName,
            quota: optionalQuota ? optionalQuota : 0
          }
        }
      }).response
    ).statusCode
    console.log("response from api", response)
  }

  return (
    <>
      <h1>Create Service</h1>
      <Form>
        <Form.Group className="mb-3" controlId="serviceName">
          <Form.Control type="email" placeholder="New Service Name" onChange={(e) => setNewServiceName(e.target.value)}/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="serviceQuota">
          <Form.Control type="number" placeholder="Quota (optional)" onChange={(e) => setOptionalQuota(e.target.value)}/>
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleCreateNewService}
        >
          Create New Service
        </Button>
      </Form>
    </>
  );
}

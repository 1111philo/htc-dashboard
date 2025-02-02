import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as API from 'aws-amplify/api'
import { fetchServices } from '../lib/api'
import FeedbackMessage from '../lib/components/FeedbackMessage'

import { Button, Form } from 'react-bootstrap'

export const Route = createFileRoute('/_auth/_admin/add-service')({
  component: AddServiceView,
  loader: async () => {
    const services = await fetchServices()
    return { services }
  },
})

function AddServiceView() {
  return (
    <>
      <h1>Create Service</h1>
      <AddNewServiceForm />
    </>
  )
}

function AddNewServiceForm() {
  const { services } = Route.useLoaderData()
  const navigate = useNavigate()

  const [newServiceName, setNewServiceName] = useState('')
  const [optionalQuota, setOptionalQuota] = useState(0)
  const [feedback, setFeedback] = useState<UserMessage>({
    text: '',
    isError: false,
  })

  const handleCreateNewService = async () => {
    // check if new service has a name
    if (!newServiceName) {
      setFeedback({
        text: 'Service must be named',
        isError: true,
      })
      return
    }
    // check if new service is unique
    let duplicateService = services.some(
      (service) => service.name === newServiceName,
    )
    if (duplicateService) {
      setFeedback({
        text: 'Service already exists.',
        isError: true,
      })
      return
    }

    // send new service name and quota to api
    const response = await await API.post({
      apiName: 'auth',
      path: '/addService',
      options: {
        body: {
          name: newServiceName,
          quota: optionalQuota ? optionalQuota : 0,
        },
      },
    }).response

    if (response!.statusCode === 200) {
      setFeedback({ text: 'Success', isError: false })
      const newService = await response.body.json()
      // route user to view for new service
      navigate({ to: `/services/${newService!.service_id}` })
    }
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleCreateNewService()
    }
  }

  return (
    <>
      <FeedbackMessage
        text={feedback.text}
        isError={feedback.isError}
        className="my-3"
      />

      <Form>
        <Form.Group className="mb-3" controlId="serviceName">
          <Form.Control
            type="email"
            placeholder="New Service Name"
            onChange={(e) => setNewServiceName(e.target.value)}
            onKeyDown={handleEnter}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="serviceQuota">
          <Form.Control
            type="number"
            placeholder="Quota (optional)"
            onChange={(e) => setOptionalQuota(parseInt(e.target.value))}
            onKeyDown={handleEnter}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleCreateNewService}>
          Create New Service
        </Button>
      </Form>
    </>
  )
}

import { Dispatch, SetStateAction, useState } from "react";
import * as API from "aws-amplify/api";
import { FeedbackMessage } from "./";

import { Button, Form } from "react-bootstrap";
import { useNavigate } from "@tanstack/react-router";

interface EditServiceFormProps {
  service: ServiceType;
  services: ServiceType[];
  setShowEditServiceModal: Dispatch<SetStateAction<boolean>>;
}

export default function EditServiceForm({
  service,
  services,
  setShowEditServiceModal
} : EditServiceFormProps) {
  const navigate = useNavigate();
  const [newServiceName, setNewServiceName] = useState<string>(service.name);
  const [newQuota, setNewQuota] = useState<number | null>(hasQuota);
  const [feedback, setFeedback] = useState({
    text: "",
    isError: false,
  })

  function hasQuota() {
    if (service.quota) {
      return service.quota
    }
    return null;
  }

  const handleClose = () => { setShowEditServiceModal(false) }

  const handleSaveService = async () => {
    if (!newServiceName) {
      setFeedback({
        text: "Service must be named",
        isError: true
      })
      return;
    }

    if (isDuplicateService(
      service,
      services,
      newServiceName
    )) {
      setFeedback({
        text: "Service already exists.",
        isError: true
      })
      return;
    }

    const updateResponse = await (
      await API.post({
        apiName: "auth",
        path: "/updateService",
        options: {
          body: {
            name: newServiceName,
            quota: newQuota,
            service_id: service.service_id
          }
        }
      }).response
    ).statusCode

    if (updateResponse === 200) {
      handleClose();
      navigate({ to: location.pathname, replace: true })
    }
  }

  return (
    <>
      <div className="p-3">
        <h2 className="mb-3">Edit Service</h2>

        <FeedbackMessage
          message={feedback}
          className="my-3"
        />

        <Form>
          <Form.Group className="mb-3" controlId="serviceName">
            <Form.Control
              type="text"
              onChange={(e) => setNewServiceName(e.target.value)}
              value={newServiceName}
              placeholder="New Service Name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="serviceQuota">
            <Form.Control
              type="number"
              onChange={(e) => setNewQuota(parseInt(e.target.value))}
              value={`${Number.isNaN(newQuota) ? '' : newQuota}`}
              placeholder="Optional Quota"
            />
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button
              variant="danger"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveService}
            >
              Save changes
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}

function isDuplicateService(
  service: ServiceType,
  services: ServiceType[],
  newServiceName: String
): boolean {
  if (newServiceName.toLowerCase() === service.name.toLowerCase()) {
    return false;
  }
  let duplicateService = services.some(
    (service) =>
      service.name.toLowerCase() === newServiceName.toLowerCase()
  )
  if (duplicateService) {
    return true;
  }
  return false;
}
import { Dispatch, SetStateAction, useState } from "react";
import * as API from "aws-amplify/api";
import FeedbackMessage from "./FeedbackMessage";

import { Button, Form } from "react-bootstrap";

interface EditServiceFormProps {
  service: ServiceType;
  services: ServiceType[];
  updateServiceName: (_: String) => void;
  updateQuota: (_: Number | null | undefined) => void;
  setShowEditServiceModal: Dispatch<SetStateAction<boolean>>;
}

export default function EditServiceForm({
  service,
  services,
  updateServiceName,
  updateQuota,
  setShowEditServiceModal
} : EditServiceFormProps) {

  const [newServiceName, setNewServiceName] = useState<String>("");
  const [newQuota, setNewQuota] = useState<Number>();
  const [feedback, setFeedback] = useState({
    text: "",
    isError: false,
  })

  const handleClose = () => { setShowEditServiceModal(false) }

  const handleSaveService = async () => {
    if (!newServiceName) {
      setFeedback({
        text: "Service must be named",
        isError: true
      })
      return;
    }

    let duplicateService = services.some((service) => service.name === newServiceName)
    if (duplicateService) {
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
      console.log("gets here!!!!!!")
      debugger
      updateQuota(newQuota);
      updateServiceName(newServiceName);
      handleClose();
    }
  }

  return (
    <>
      <div className="p-3">
        <h2 className="mb-3">Edit Service</h2>

        <FeedbackMessage
          text={feedback.text}
          isError={feedback.isError}
          className="my-3"
        />

        <Form>
          <Form.Group className="mb-3" controlId="serviceName">
            <Form.Control
              type="text"
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="New Service Name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="serviceQuota">
            <Form.Control
              type="number"
              onChange={(e) => setNewQuota(parseInt(e.target.value))}
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
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  deleteServiceData,
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  fetchServices,
  getAvailableSlots,
} from "../lib/api";
import {
  AvailableSlotCard,
  CompletedTable,
  EditServiceForm,
  OccupiedSlotCard,
  QueuedTable,
} from "../lib/components";
import { Button, Modal } from "react-bootstrap";

export const Route = createFileRoute("/_auth/services_/$serviceId")({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => {
    return { serviceId: parseInt(params.serviceId) };
  },
  beforeLoad: async ({ params: { serviceId } }) => {
    const service = await fetchServiceByID(serviceId);
    return { service };
  },
  loader: async ({ context: { service, authUserIsAdmin } }) => {
    const services = await fetchServices();

    return {
      authUserIsAdmin,
      service,
      services,
    };
  },
});

function ServiceView() {
  const navigate = useNavigate();
  const { authUserIsAdmin, service, services } = Route.useLoaderData();
  const queryClient = useQueryClient();
  queryClient.invalidateQueries();

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);

  const { data: guestsSlotted, isPending: isSlotsPending } = useQuery({
    queryFn: () => fetchServiceGuestsSlotted(service.service_id),
    queryKey: ["guestsSlotted"],
    enabled: !!service.quota,
  });
  const { data: guestsQueued, isPending: isQueuedPending } = useQuery({
    queryFn: () => fetchServiceGuestsQueued(service.service_id),
    queryKey: ["guestsQueued"],
  });
  const { data: guestsCompleted, isPending: isCompletedPending } = useQuery({
    queryFn: () => fetchServiceGuestsCompleted(service.service_id),
    queryKey: ["guestsCompleted"],
  });

  const deleteService = async () => {
    const proceed = confirm("Are you sure you want to delete this service?");
    if (!proceed) return;

    const deleteResponse = await deleteServiceData(service.service_id);
    if (deleteResponse === 200) {
      navigate({ to: "/new-visit", replace: true });
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">{service.name}</h1>
        {authUserIsAdmin && (
          <>
            <Button
              variant="outline-primary"
              onClick={() => setShowEditServiceModal(true)}
            >
              Edit Service
            </Button>

            <Button variant="danger" onClick={() => deleteService()}>
              Delete Service
            </Button>
          </>
        )}
      </div>

      <Modal show={showEditServiceModal}>
        <EditServiceForm
          service={service}
          services={services}
          setShowEditServiceModal={setShowEditServiceModal}
        />
      </Modal>

      {service.quota ? (
        <>
          <h2>Slots</h2>
          {isSlotsPending ? (
            <p>Loading...</p>
          ) : (
            <ServiceSlotCards>
              {
                // for every slot, display the guestSlotted or empty/available row
                Array.from({ length: service.quota }).map((slot, slotIndex) => {
                  const slotNum = slotIndex + 1;
                  const guest = guestsSlotted?.find(
                    (g) => g.slot_id === slotNum
                  );

                  if (guest) {
                    return (
                      <OccupiedSlotCard
                        guest={guest}
                        slotNum={slotNum}
                        key={`${slotIndex}-${slotNum}`}
                      />
                    );
                  } else {
                    return (
                      <AvailableSlotCard
                        slotNum={slotNum}
                        key={`${slotIndex}-${slotNum}`}
                      />
                    );
                  }
                })
              }
            </ServiceSlotCards>
          )}
        </>
      ) : (
        ""
      )}

      {isQueuedPending ? (
        <>
          <h2>Queue</h2>
          <p>Loading...</p>
        </>
      ) : (
        <QueuedTable
          guestsQueued={guestsQueued}
          service={service}
        />
      )}

      {isCompletedPending ? (
        <>
          <h2>Completed</h2>
          <p>Loading...</p>
        </>
      ) : (
        <CompletedTable guestsCompleted={guestsCompleted} />
      )}
    </>
  );
}

function ServiceSlotCards({ children }) {
  return <div className="mb-5">{children}</div>;
}

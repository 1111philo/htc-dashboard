/** API calls related to Services */

import * as API from "aws-amplify/api";
import { sortByTimeDescending } from "../utils";

export async function fetchServiceByID(serviceId: number) {
  const serviceResponse = await (
    API.post({
      apiName: "auth",
      path: "/getServices",
      options: {
        body: {
          service_id: serviceId
        }
      }
    }).response
  )
  const [service,]: ServiceType[] = (await serviceResponse.body.json())!.rows
  return service;
}

export async function fetchServices() {
  const response = await (
    API.post({
      apiName: "auth",
      path: "/getServices",
      options: {
        body: {
          limit: 1000
        }
      }
    }).response
  )
  const serviceTypes: ServiceType[] =
    (await response.body.json())!.rows.sort((s1, s2) => s1.service_id - s2.service_id)

  return serviceTypes;
}

export async function fetchServiceGuestsSlotted(serviceId: number): Promise<GuestResponse[]>{
  const guestsSlotted = await (
    await API.post({
      apiName: "auth",
      path: "/serviceGuestsSlotted",
      options: {
        body: {
          service_id: serviceId
        }
      }
    }).response
  ).body.json()
  return guestsSlotted;
}

export async function fetchServiceGuestsQueued(serviceId: number) {
  const guestsQueuedResponse = await (
    API.post({
      apiName: "auth",
      path: "/serviceGuestsQueued",
      options: {
        body: {
          service_id: serviceId
        }
      }
    }).response
  )
  const unsortedGuestsQueued = (await guestsQueuedResponse.body.json())
  // TODO: resolve unsortedQuestsQueued into an object that is accepted in sortByTimeDescending
  const guestsQueued = sortByTimeDescending(unsortedGuestsQueued, 'queued_at')
  return guestsQueued;
}

export async function fetchServiceGuestsCompleted(serviceId: number) {
  const guestsCompletedResponse = await (
    API.post({
      apiName: "auth",
      path: "/serviceGuestsCompleted",
      options: {
        body: {
          service_id: serviceId
        }
      }
    }).response
  )
  const guestsCompleted = (await guestsCompletedResponse.body.json())!
  return guestsCompleted;
}

// send api call to /updateGuestServiceStatus
export async function updateGuestServiceStatus(
  newStatus: string,
  guest: GuestResponse,
  slotNum: number | null
): Promise<number> {
  const updateGuestServiceStatusResponse = await (
    await API.post({
      apiName: "auth",
      path: "/updateGuestServiceStatus",
      options: {
        body: {
          status: newStatus,
          guest_service_id: guest.guest_service_id,
          slot_id: slotNum
        }
      }
    }).response
  ).statusCode
  return updateGuestServiceStatusResponse;
}

export async function getAvailableSlots(service): Promise<number[]> {
  const { service_id, quota } = service;

  let totalSlots = Array.from({ length: quota }, (_, i) => i + 1);
  const guestsSlotted = await fetchServiceGuestsSlotted(service_id)
  const occupiedSlots = guestsSlotted.map((g) => g.slot_id)
  const availableSlots = totalSlots.reduce((accum: number[], curr: number, i) => {
    if (!occupiedSlots.includes(curr)) {
      accum.push(curr)
    }
    return accum
  }, [])

  return availableSlots;
}
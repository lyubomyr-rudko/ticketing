import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@lyubomyr.rudko/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}

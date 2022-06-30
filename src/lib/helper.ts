import { toString } from 'lodash-es';
import JSONbig from 'json-bigint';

import { HEART_BEAT_MESSAGE } from '../constants';


export const filterMessage = (messageEvent: any, eventNames?: string | string[]) => {
  const data = messageEvent.data;
  let message = {
    event: '',
  };

  if (toString(messageEvent.data) === HEART_BEAT_MESSAGE) {
    return;
  }

  try {
    message = data ? JSONbig({ storeAsString: true }).parse(data) : {};
  } catch (error) {}

  if (!data) {
    return;
  }

  if (!eventNames) {
    return message;
  }

  if (eventNames.includes(message.event)) {
    return message;
  }

  return;
}

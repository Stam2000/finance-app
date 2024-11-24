import { defineBackend } from '@aws-amplify/backend';
import { myFirstFunction } from './my-first-function/ressource';


/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  myFirstFunction,
});

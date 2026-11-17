import React from 'react';
import Flex from './Flex';

import { usePersistedState, useSessionState } from '@dannyman/use-store';

const App = () => {
  const [sessionState, setSessionState] = useSessionState('key:name:session', { message: 'Hello world!' });
  const [persistedState, setPersistedState] = usePersistedState('key:name:persisted', 'Gotta catch em all!');

  const [, setAnotherSessionState] = useSessionState('key:name:anothersession');
  const [anotherPersistedState] = usePersistedState('key:name:anotherpersisted', null);

  const onUpdate = (value) => {
    setSessionState({ message: value });
    setAnotherSessionState(100); // Another Session State, that only allows writing to the storage
  };

  console.info('Another Persisted State, with read-only options:', anotherPersistedState);

  return (
    <React.Fragment>
      <Flex>
        <Flex
          alignItems="left"
          isSection>
          <h1>@dannyman/use-store Hooks</h1>
          <p>These hooks persist small JSON values and share them between matching hook instances.</p>
          <h4>Features:</h4>
          <ul>
            <li>Provides a familiar <b>useState</b>-style tuple and functional setters.</li>
            <li>Stores JSON-compatible values in browser storage.</li>
            <li>Choose <i>localStorage</i> for persistence or <i>sessionStorage</i> for tab-scoped values.</li>
            <li>Local storage updates are synced across same-origin tabs.</li>
            <li>Session storage stays scoped to the current tab.</li>
            <li>Easy to use.</li>
          </ul>
        </Flex>
        <hr
          style={{ width: '80%' }} />
        <Flex
          // direction="row"
          backgroundColor="white"
          fullWidth
          isSection>
          <Flex
            style={{ maxWidth: '50%' }}
            alignItems="left">
            <h3>Try the <i>useSessionState</i> Hook</h3>
            <p>Use <i>useSessionState</i> for values that should live in the current tab's session storage and be cleared when that tab's session ends.</p>
            <ol>
              <li>Add some string value to the input field.</li>
              <li>Reload this tab.</li>
              <li>The value remains for this tab's session.</li>
            </ol>
            <input
              type="text"
              onChange={(e) => onUpdate(e.target.value)} />
            <p><b>Value:</b> {`${sessionState.message}`} </p>
          </Flex>
          <hr
            style={{ width: '80%' }} />
          <Flex
            style={{ maxWidth: '50%' }}
            alignItems="left">
            <h4>Try the <i>usePersistedState</i> Hook</h4>
            <p>Use <i>usePersistedState</i> for small values that should survive reloads and sync across same-origin tabs.</p>
            <ol>
              <li>Add some string value to the input field.</li>
              <li>Open this page in another same-origin tab.</li>
              <li>On the new tab, add a different string value to the input.</li>
              <li>Both tabs state should persist on reload or redirect.</li>
              <li>Values in both tabs sync automatically.</li>
            </ol>
            <input
              type="text"
              onChange={(e) => setPersistedState(e.target.value)} />
            <p><b>Value:</b> {`${persistedState}`} </p>
          </Flex>
        </Flex>
      </Flex>
    </React.Fragment >
  );
};

export default App;

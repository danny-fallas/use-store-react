import React from 'react';
import { usePersistedState, useSessionState } from 'use-store-react';

const App = () => {
  const [email, setEmail] = usePersistedState('key:name:persisted', 'patrik@star.com', true);
  const [name, setName] = useSessionState('key:name:session', 'Patrik', true);

  return (
    <div>
      <p>
        Email on Local Storage:
        <input
          defaultValue={email}
          type="text"
          onChange={(e) => setEmail(e.target.value)} />
      </p>
      <p>
        Name on Session Storage:
        <input
          defaultValue={name}
          type="text"
          onChange={(e) => setName(e.target.value)} />
      </p>
      <p>
        {`${name} will receive an email to: ${email}`}
      </p>
    </div>
  )
}

export default App;
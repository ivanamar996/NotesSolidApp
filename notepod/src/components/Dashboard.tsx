import React from 'react';
import { LogoutButton, useWebId } from '@solid/react';
import { foaf } from 'rdf-namespaces';
import { useProfile } from '../hooks/useProfile';
import { NotesList } from './NotesList';
import { getPodData } from '../services/getPodData';

export const Dashboard: React.FC = () => {
  const webId = useWebId();
  const podData = React.useMemo(() => (typeof webId === 'string') ? getPodData(webId) : undefined, [webId]);
  const profile = useProfile(podData);

  if (!podData) {
    return (
      <section className="section">
        <p className="content">Loading data&hellip;</p>
      </section>
    );
  }

  const name = (profile) ? profile.getString(foaf.name) : null;
  const title = (name)
    ? `${name}'s notes`
    : 'Notes';

  return <>
    <div className="columns">
      <section className="section">
        <h1 className="title">
          {title}
        </h1>
      </section>
      <div className="column has-text-right" style={{marginTop:50, marginRight:30}}>
        <LogoutButton className="button" />
      </div>
    </div>
    <NotesList podData={podData} />
  </>;
};

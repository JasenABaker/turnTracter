import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCombatantStatus } from '../utils/combatantStatus';
import AbilityScoreGrid from './AbilityScoreGrid';
import CombatantStatusDialog from './CombatantStatusDialog';
import HoverStatBlock from './HoverStatBlock';

const ENTRY_LABELS = [
  ['trait', 'Trait'],
  ['action', 'Action'],
  ['bonus-action', 'Bonus'],
  ['reaction', 'Reaction'],
  ['legendary-action', 'Legendary'],
  ['lair-action', 'Lair'],
];

function formatMemberHp(m) {
  if (m.unknownHp) return `${m.damageTaken || 0} dmg`;
  const status = getCombatantStatus(m);
  if (status?.key === 'dead') return 'Dead';
  return `${m.currentHp}/${m.hp}`;
}

export default function CombatantStatCard({ members, isActive, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);

  const primary = members[0];
  const statuses = members.map(m => getCombatantStatus(m));
  const isDead = statuses.every(s => s?.key === 'dead');
  const isUnconscious = !isDead && statuses.every(s => s?.key === 'dead' || s?.key === 'unconscious');
  const statusEmoji = members.length === 1 && statuses[0] ? statuses[0].label.split(' ')[0] : null;

  const entries = primary.entries || [];
  const attackEntries = entries.filter(e => e.category === 'action' && e.hitOrDc);

  const baseName = primary.name.replace(/\s+\d+$/, '');

  const subtitleParts = [primary.size, primary.creatureType].filter(Boolean);
  const subtitle = subtitleParts.join(' ') + (primary.isNpc ? ' · NPC' : primary.challengeRating ? ` · CR ${primary.challengeRating}` : '');

  const cardClass = [
    'stat-card',
    isActive && 'stat-card-active',
    isDead && 'stat-card-dead',
    isUnconscious && 'stat-card-unconscious',
  ].filter(Boolean).join(' ');

  return (
    <>
      <HoverStatBlock as="div" monster={primary} className={cardClass} onClick={() => setShowDialog(true)} center>
        <div className="stat-card-header">
          <h3 className={isDead ? 'strikethrough' : ''}>
            {baseName}
            {members.length > 1 && <span className="stat-card-count">×{members.length}</span>}
          </h3>
          <div className="stat-card-header-right">
            {statusEmoji && <span className="tag tag-outline">{statusEmoji}</span>}
            {members.length === 1 ? (
              <Link
                to={`/monster-creator?edit=${primary.id}`}
                className="stat-card-edit-link"
                onClick={e => e.stopPropagation()}
                title="Edit stat block"
              >
                ✎
              </Link>
            ) : (
              primary.sourceTemplateId && (
                <Link
                  to={`/monster-creator?edit=${primary.sourceTemplateId}`}
                  className="stat-card-edit-link"
                  onClick={e => e.stopPropagation()}
                  title="Edit template stat block"
                >
                  ✎
                </Link>
              )
            )}
          </div>
        </div>
        {subtitle.trim() && <div className="stat-card-subtitle">{subtitle}</div>}
        <div className="stat-card-vitals">
          <span><strong>AC</strong> {primary.unknownAc ? '?' : primary.armorClass + (primary.bonusAc || 0)}</span>
          <span>
            <strong>HP</strong>{' '}
            {members.length === 1
              ? (primary.unknownHp ? `${primary.damageTaken || 0} dmg taken` : `${primary.currentHp}/${primary.hp}`)
              : <span className="stat-card-instance-summary">{members.map(m => formatMemberHp(m)).join(' · ')}</span>}
          </span>
          {primary.speed && <span><strong>Spd</strong> {primary.speed}</span>}
        </div>

        <div className="stat-card-abilities">
          <AbilityScoreGrid companion={primary} readOnly />
        </div>

        {attackEntries.length > 0 && (
          <div className="table-container">
            <table className="table stat-card-attack-table">
              <thead><tr><th>Attack</th><th>Hit</th><th>Dmg</th></tr></thead>
              <tbody>
                {attackEntries.map(e => (
                  <tr key={e.id}><td>{e.name}</td><td>{e.hitOrDc}</td><td>{e.damage || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="stat-card-entries">
          {ENTRY_LABELS.map(([category, label]) => {
            const names = entries.filter(e => e.category === category).map(e => e.name);
            if (names.length === 0) return null;
            return (
              <div className="stat-card-entry-line" key={category}>
                <strong>{label}</strong> {names.join(', ')}
              </div>
            );
          })}
        </div>
      </HoverStatBlock>

      {showDialog && (
        <CombatantStatusDialog
          combatants={members}
          onClose={() => setShowDialog(false)}
          onSaved={onUpdate}
        />
      )}
    </>
  );
}

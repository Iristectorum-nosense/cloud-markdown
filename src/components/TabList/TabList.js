import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNameTrans from '../../util/classNameTrans';
import { CloseSvg, UnsaveSvg } from '../../util/svg';
import './TabList.scss';

TabList.prototypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsaveIds: PropTypes.array,
  onTabClick: PropTypes.func.isRequired,
  onTabClose: PropTypes.func.isRequired
}

export default function TabList({ files, activeId, unsaveIds, onTabClick, onTabClose }) {
  return (
    <ul className="nav nav-pills tab-list-container">
      {
        files.map(file => {
          const unsaved = unsaveIds.includes(file.id);
          const classNames = classNameTrans({
            'nav-link': true,
            'active': file.id === activeId,
            'unsave': unsaved
          })
          return (
            <li className="nav-item tab-list-item"
              key={file.id}
            >
              <a className={classNames}
                href="#"
                onClick={(e) => { e.preventDefault(); onTabClick(file.id); }}
              >
                {file.title}
                {
                  unsaved &&
                  <span className="unsave-svg">
                    <UnsaveSvg size={14} />
                  </span>
                }
                <span className="close-svg"
                  onClick={(e) => { e.stopPropagation(); onTabClose(file.id); }}
                >
                  <CloseSvg size={14} />
                </span>
              </a>
            </li>
          )
        })
      }
    </ul>
  )
}
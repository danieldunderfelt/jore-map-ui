import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { SidebarStore } from '../../stores/sidebarStore';
import lineHelper from '../../util/lineHelper';
import ToggleButton from '../controls/ToggleButton';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import './LineEditView.css';
import { ILine } from '../../models';

interface ILineEditViewState {
    type: string;
}

interface ILineEditViewProps {
    sidebarStore?: SidebarStore;
    lines: ILine[];
}

@inject('sidebarStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps, ILineEditViewState> {

    public render(): any {
        return (
        <span className='editable-line-wrapper'>
          {this.props.lines.map((node: ILine) => {
              const transitType = lineHelper.convertTransitTypeCodeToTransitType(node.lineLayer);
              return (
                <div className='editable-line' key={node.lineId}>
                  <span className='line-wrapper'>
                    {lineHelper.getTransitIcon(transitType, false)}
                    <span className={'line-number-' + node.lineLayer}>
                        {lineHelper.parseLineNumber(node.lineId)}
                    </span>
                    {node.routeNumber}
                  </span>
                  <div className='direction-toggle'>
                    <span className='direction-toggle-title'>suunta 1 </span>
                    <ToggleButton type={transitType}/>
                  </div>
                  <div className='checkbox-container'>
                    <input
                      type='checkbox'
                      className='checkbox-input'
                      checked={false}
                    />
                    Kopioi reitti toiseen suuntaan
                  </div>
                </div>
              );
          })
          }
          <div className='editableLine-input-container'>
            <label className='editableLine-input-container-title'>
                HAE TOINEN LINJA TARKASTELUUN
            </label>
            <input
              placeholder='Hae reitti'
              className='editableLine-input'
              type='text'
            />
          </div>
          <div className='editableLine-input-container'>
            <span className='editableLine-input-container-title'>TARKASTELUPÄIVÄ</span>
            <input
              placeholder='25.8.2017'
              className='editableLine-input'
              type='text'
            />
          </div>
          <div className='editableLine-graph'>
            <div className='container'>
            <label className='editableLine-input-container-title'>VERKKO</label>
            <TransitToggleButtonBar filters={this.props.sidebarStore!.filters || []} />
            <div className='checkbox-container'>
              <input
                type='checkbox'
                className='checkbox-input'
                checked={false}
              />
              Hae alueen linkit
            </div>
            <div className='checkbox-container'>
              <input
                type='checkbox'
                className='checkbox-input'
                checked={false}
              />
              Hae alueen solmut
            </div>
            </div>
          </div>
        </span>
        );
    }
}

export default LineEditView;

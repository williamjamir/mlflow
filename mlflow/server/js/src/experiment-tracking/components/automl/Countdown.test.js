import React from 'react';
import { shallow } from 'enzyme';

import { Countdown } from './Countdown';

describe('Countdown', () => {
  beforeEach(() => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2021-01-01T00:00:00.000Z').valueOf());
  });
  test('should not render if finishtime is undefined', () => {
    const props = {
      finishTime: undefined,
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap).toEqual({});
  });
  test('should not render if finishtime is NaN', () => {
    const props = {
      finishTime: NaN,
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap).toEqual({});
  });
  test('should render 01:01', () => {
    const props = {
      finishTime: new Date('2021-01-01T00:01:01.23Z').valueOf(),
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap.text()).toEqual('01:01');
  });
  test('should render 1:01:01', () => {
    const props = {
      finishTime: new Date('2021-01-01T01:01:01.23Z').valueOf(),
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap.text()).toEqual('1:01:01');
  });
  test('should render 10:10:10', () => {
    const props = {
      finishTime: new Date('2021-01-01T10:10:10.000Z').valueOf(),
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap.text()).toEqual('10:10:10');
  });
  test('should render 25:10:10', () => {
    const props = {
      finishTime: new Date('2021-01-02T01:10:10.000Z').valueOf(),
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap.text()).toEqual('25:10:10');
  });
  test('should render 00:00 for past times', () => {
    const props = {
      finishTime: new Date('2020-01-01T00:00:00.000Z').valueOf(),
    };
    const wrap = shallow(<Countdown {...props} />);
    expect(wrap.text()).toEqual('00:00');
  });
});

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ServiceItem } from '../src/components/ServiceItem';
import type { BleService } from '../src/ble/bleReducer';

describe('ServiceItem', () => {
  const mockService: BleService = {
    uuid: '0000180f-0000-1000-8000-00805f9b34fb',
    characteristics: [
      {
        service: '0000180f-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a19-0000-1000-8000-00805f9b34fb',
        properties: {
          Read: 'read',
          Write: 'write',
        },
      },
      {
        service: '0000180f-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a1a-0000-1000-8000-00805f9b34fb',
        properties: {
          Notify: 'notify',
        },
      },
    ],
  };

  it('should render service UUID', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={mockService} />);
    });
    const instance = tree!.root;
    expect(
      instance.findByProps({ children: '0000180f-0000-1000-8000-00805f9b34fb' }),
    ).toBeTruthy();
  });

  it('should render Service label', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={mockService} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Service' })).toBeTruthy();
  });

  it('should render all characteristics', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={mockService} />);
    });
    const instance = tree!.root;
    expect(
      instance.findByProps({ children: '00002a19-0000-1000-8000-00805f9b34fb' }),
    ).toBeTruthy();
    expect(
      instance.findByProps({ children: '00002a1a-0000-1000-8000-00805f9b34fb' }),
    ).toBeTruthy();
  });

  it('should render Characteristic label for each characteristic', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={mockService} />);
    });
    const instance = tree!.root;
    const labels = instance.findAllByProps({ children: 'Characteristic' });
    // Should have at least 2 characteristics (may have more due to component structure)
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it('should render primary property badges (Read, Write, Notify)', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={mockService} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Read' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Write' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Notify' })).toBeTruthy();
  });

  it('should render secondary property badges', () => {
    const serviceWithSecondary: BleService = {
      uuid: 'service-1',
      characteristics: [
        {
          service: 'service-1',
          characteristic: 'char-1',
          properties: {
            WriteWithoutResponse: 'write-without-response',
            Indicate: 'indicate',
          },
        },
      ],
    };

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <ServiceItem service={serviceWithSecondary} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'WriteWithoutResponse' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Indicate' })).toBeTruthy();
  });

  it('should render Unknown badge when characteristic has no properties', () => {
    const serviceWithoutProperties: BleService = {
      uuid: 'service-1',
      characteristics: [
        {
          service: 'service-1',
          characteristic: 'char-1',
        },
      ],
    };

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <ServiceItem service={serviceWithoutProperties} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Unknown' })).toBeTruthy();
  });

  it('should handle service with no characteristics', () => {
    const emptyService: BleService = {
      uuid: 'service-1',
      characteristics: [],
    };

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<ServiceItem service={emptyService} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'service-1' })).toBeTruthy();
    expect(instance.findByProps({ children: 'Service' })).toBeTruthy();
  });

  it('should handle multiple characteristics with same service UUID', () => {
    const serviceWithMultipleChars: BleService = {
      uuid: 'service-1',
      characteristics: [
        {
          service: 'service-1',
          characteristic: 'char-1',
          properties: { Read: 'read' },
        },
        {
          service: 'service-1',
          characteristic: 'char-2',
          properties: { Write: 'write' },
        },
        {
          service: 'service-1',
          characteristic: 'char-3',
          properties: { Notify: 'notify' },
        },
      ],
    };

    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <ServiceItem service={serviceWithMultipleChars} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'char-1' })).toBeTruthy();
    expect(instance.findByProps({ children: 'char-2' })).toBeTruthy();
    expect(instance.findByProps({ children: 'char-3' })).toBeTruthy();
  });
});

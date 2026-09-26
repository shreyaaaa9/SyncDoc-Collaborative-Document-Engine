import type { Document } from '../types/document';

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Embedded Systems Technical Specification',
    description: 'Technical specification for an embedded system.',
    owner: 'Kirubakar',
    lastEdited: 'Today',
    status: 'Draft',
    tags: ['Firmware', 'Hardware', 'ARM Cortex-M4'],
    wordCount: 420,
    content: `
      <h2 id="system-overview">System Overview</h2>
      <p>SyncDoc is a collaborative technical documentation platform designed for engineering teams. This embedded specification outlines the operational boundaries, memory segmentation, and peripheral communication protocols for the real-time sensor node.</p>
      
      <h2 id="architecture">Architecture</h2>
      <p>The system contains multiple components that communicate through clearly defined interfaces. The edge gateway interconnects with low-power microcontrollers through isolated SPI and I2C buses, streaming telemetry back to the centralized telemetry broker.</p>
      <pre><code>// Sensor Node Controller Loop (FreeRTOS)
void vTaskSensorPoll(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    while (1) {
        sensor_data_t sample = hal_sensor_read_calibrated();
        ringbuf_push(&telemetry_buffer, &sample);
        vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(50));
    }
}</code></pre>

      <h2 id="requirements">Requirements</h2>
      <p>The firmware subsystem must satisfy the following core operational requirements:</p>
      <ul>
        <li><strong>Reliable document editing</strong>: Consistent state across multi-core updates.</li>
        <li><strong>Clear document structure</strong>: Standardized memory register mapping.</li>
        <li><strong>Responsive interface</strong>: Sub-5ms interrupt dispatch latencies.</li>
        <li><strong>Easy document management</strong>: Versioned over-the-air (OTA) bootloader signatures.</li>
      </ul>

      <h2 id="implementation">Implementation</h2>
      <p>The firmware HAL is modularized into discrete drivers:</p>
      <ol>
        <li>Direct Memory Access (DMA) channel allocation for high-bandwidth telemetry capture.</li>
        <li>Hardware Crypto Accelerator activation for cryptographic AES-GCM verification.</li>
        <li>Low-power sleep-state scheduler operating during bus inactivity.</li>
      </ol>

      <h2 id="testing">Testing</h2>
      <p>Validation requires unit testing with Ceedling and Unity, coupled with hardware-in-the-loop (HIL) automation tests. Current test coverage is maintained above 94% across all critical peripheral drivers.</p>
    `.trim()
  },
  {
    id: '2',
    title: 'IoT Architecture Document',
    description: 'IoT system architecture and requirements.',
    owner: 'Kirubakar',
    lastEdited: 'Yesterday',
    status: 'Active',
    tags: ['IoT', 'Cloud', 'MQTT', 'Kafka'],
    wordCount: 580,
    content: `
      <h2 id="system-overview">System Overview</h2>
      <p>The IoT Architecture Document establishes the multi-tier topology connecting remote telemetry assets to the analytics cluster. It details ingestion scalability, device provisioning, and protocol conversion pipelines.</p>

      <h2 id="architecture">Architecture</h2>
      <p>The architecture is partitioned into Edge Ingestion, Event Streaming with Kafka, and Analytical Time-Series Storage. Mutual TLS (mTLS) with X.509 device certificates guarantees ingress authentication.</p>
      <pre><code>+---------------+        mTLS (8883)       +-------------------+
|  IoT Devices  | ----------------------> | EMQX Broker Grid  |
+---------------+                         +-------------------+
                                                    |
                                                    v
                                           +-------------------+
                                           | Kafka Event Bus   |
                                           +-------------------+</code></pre>

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li>Horizontal scaling up to 1,000,000 active concurrent TCP connections.</li>
        <li>99.99% ingestion uptime with automatic edge retry buffering.</li>
        <li>Sub-second end-to-end data transit from sensor edge to analytics engine.</li>
      </ul>

      <h2 id="implementation">Implementation</h2>
      <p>Deployments leverage Kubernetes microservices orchestrated via Helm charts. Ingress rate limiters protect upstream brokers from traffic burst surges.</p>

      <h2 id="testing">Testing</h2>
      <p>Load simulation conducted via locust test clusters evaluating message throughput at 50,000 messages per second under high network jitter conditions.</p>
    `.trim()
  },
  {
    id: '3',
    title: 'Smart Automation Specification',
    description: 'Automation system technical documentation.',
    owner: 'Kirubakar',
    lastEdited: '2 days ago',
    status: 'Draft',
    tags: ['Automation', 'Robotics', 'CANbus'],
    wordCount: 310,
    content: `
      <h2 id="system-overview">System Overview</h2>
      <p>Smart Automation Specification details the industrial automation sequence controller for robotics assembly lines, orchestrating pneumatic actuators, optical sensors, and programmable logic controllers (PLCs).</p>

      <h2 id="architecture">Architecture</h2>
      <p>Fieldbus networks are powered by deterministic CANopen and Modbus TCP links, reporting status back to the supervisory control and data acquisition (SCADA) server.</p>

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li>Emergency Stop (E-Stop) hard-wired fail-safe latency < 10ms.</li>
        <li>Deterministic cycle times for precision tool head positioning.</li>
        <li>Compliant with ISO 13849-1 functional safety category 4.</li>
      </ul>

      <h2 id="implementation">Implementation</h2>
      <p>Controller routines are written in structured text and compiled into real-time target executables with dual redundant watchdog timers.</p>

      <h2 id="testing">Testing</h2>
      <p>Hardware fault injection tests run continuously on test benches to confirm immediate safe-state transitions upon signal loss.</p>
    `.trim()
  }
];

export const OUTLINE_ITEMS = [
  { id: 'system-overview', title: 'System Overview', level: 1 },
  { id: 'architecture', title: 'Architecture', level: 1 },
  { id: 'requirements', title: 'Requirements', level: 1 },
  { id: 'implementation', title: 'Implementation', level: 1 },
  { id: 'testing', title: 'Testing', level: 1 },
];

/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-redeclare */
/* exported gaEvent, gaTiming, */

/**
 * Logs an event to Google Analytics.
 * @param category The object that was interacted with.
 * @param action The type of interaction.
 * @param label Useful for categorizing events.
 * @param value A numeric value associated with the event.
 * @param nonInteraction Indicates a non-interaction event.
 */
export function gaEvent(category: string, action: string, label?: string | null, value?: number | null, nonInteraction?: boolean): void {
  // eslint-disable-next-line no-console
  console.log('🔔', category, action, label, value);
  if (location.hostname === 'localhost') {
    return;
  }
  const obj: { eventCategory: string; eventAction: string; eventLabel?: string; eventValue?: number; nonInteraction?: boolean; } = {
    eventCategory: category,
    eventAction: action,
  };
  if (label) {
    obj.eventLabel = label;
  }
  if (value) {
    obj.eventValue = value;
  }
  if (nonInteraction) {
    obj.nonInteraction = true;
  }
  if (window.ga) {
    window.ga('send', 'event', obj);
  }
}

/**
 * Logs an timing event to Google Analytics.
 * @param category Category of timer.
 * @param variable The variable being timed.
 * @param value A numeric value associated with the event.
 * @param label Useful for categorizing events.
 */
function gaTiming(category: string, variable: string, value: number, label?: string): void {
  value = parseInt(String(value), 10);
  // eslint-disable-next-line no-console
  console.log('⏱️', category, variable, value, label);
  if (location.hostname === 'localhost') {
    return;
  }
  if (window.ga) {
    window.ga('send', 'timing', category, variable, value, label);
  }
}

/**
 * Analytics for window type: browser, standalone, standalone-ios
 */
window.addEventListener('load', () => {
  setTimeout(() => {
    let windowStyle = 'browser';
    if (window.navigator.standalone === true) {
      windowStyle = 'standalone-ios';
    } else if (matchMedia('(display-mode: standalone)').matches === true) {
      windowStyle = 'standalone';
    }
    gaEvent('Window Style', windowStyle, null, null, true);
  }, 3100);
});

/**
 * Performance analytics: load & paint
 */
window.addEventListener('load', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'window-load', pNow);
    setTimeout(() => {
      const paintMetrics = performance.getEntriesByType('paint');
      if (paintMetrics && paintMetrics.length > 0) {
        paintMetrics.forEach((entry) => {
          const name = entry.name;
          const time = Math.round(entry.startTime + entry.duration);
          gaTiming('Start', name, time);
        });
      }
    }, 3000);
  }
});

/**
 * Performance analytics: GA PageView, DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'dom-content-loaded', pNow);
  }
  if (window.ga) {
    window.ga('send', 'pageview', '/');
    // eslint-disable-next-line no-console
    console.log('👀', 'pageview', '/');
  }
});

/**
 * Log the app version.
 */
window.addEventListener('load', () => {
  gaEvent('App Version', '[[VERSION]]', null, null, true);
});

/**
 * Log page visibility.
 */
document.addEventListener('visibilitychange', () => {
  const state = document.hidden === true ? 'hidden' : 'visible';
  gaEvent('Page Visibility', state, null, null, true);
});

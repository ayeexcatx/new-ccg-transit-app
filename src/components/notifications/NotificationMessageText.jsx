import React from 'react';

function getMessageParts(notification, message) {
  if (typeof message !== 'string') {
    return { leadingText: message, customText: '' };
  }

  const isOwnerInformationalUpdate = notification?.notification_category === 'dispatch_update_info';
  if (!isOwnerInformationalUpdate) {
    return { leadingText: message, customText: '' };
  }

  const [leadingText, ...customLines] = message.split('\n');
  return {
    leadingText,
    customText: customLines.join('\n'),
  };
}

export default function NotificationMessageText({
  notification,
  message,
  className = '',
}) {
  const { leadingText, customText } = getMessageParts(notification, message);

  if (!customText) {
    return <p className={className}>{message}</p>;
  }

  return (
    <p className={className}>
      <span>{leadingText}</span>
      <br />
      <span className="text-red-600">{customText}</span>
    </p>
  );
}

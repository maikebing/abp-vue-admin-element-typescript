﻿using LINGYUN.Abp.Notifications;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace LINGYUN.Abp.MessageService.Notifications
{
    public interface IUserNotificationRepository : IBasicRepository<UserNotification, long>
    {
        Task<bool> AnyAsync(Guid userId, long notificationId);

        Task InsertUserNotificationsAsync(IEnumerable<UserNotification> userNotifications);

        Task<UserNotification> GetByIdAsync(Guid userId, long notificationId);

        Task<List<Notification>> GetNotificationsAsync(Guid userId, NotificationReadState readState = NotificationReadState.UnRead, int maxResultCount = 10);

        Task<long> GetCountAsync(Guid userId, string filter = "", NotificationReadState readState = NotificationReadState.UnRead);

        Task<List<Notification>> GetNotificationsAsync(Guid userId, string filter = "", string sorting = nameof(Notification.NotificationId), NotificationReadState readState = NotificationReadState.UnRead, int skipCount = 1, int maxResultCount = 10);

        Task ChangeUserNotificationReadStateAsync(Guid userId, long notificationId, NotificationReadState readState);
    }
}

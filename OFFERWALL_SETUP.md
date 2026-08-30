# RewardsVerse Offerwall Setup

Tài liệu này mô tả cấu hình mà RewardsVerse đọc từ Render Environment Variables. **Không điền secret vào GitHub**; mọi giá trị thật chỉ được lưu trong Render.

## Nguyên tắc cấu hình

RewardsVerse sử dụng một endpoint postback chung:

```text
https://rewardsverse.online/api/postback/{provider}
```

Link hoàn chỉnh được tạo trong Admin Panel → **Postbacks** chỉ khi provider có secret xác thực. Trạng thái `Configured` có nghĩa là server đã nhận đủ giá trị runtime cần thiết; nó không xác nhận tài khoản publisher hoặc offerwall đã bật conversion.

Đối với mỗi provider, hãy mở publisher dashboard của chính provider đó, tìm phần có tên **Postback**, **Conversion Tracking**, **Callback**, **Offerwall Integration**, **API** hoặc **Security**, rồi sao chép đúng giá trị được provider chỉ định. Tên menu có thể thay đổi theo tài khoản; nếu không thấy mục này, cần liên hệ provider. Không đoán giá trị.

## Bảng cấu hình

| Offerwall | Giá trị cần lấy từ publisher dashboard | Điền vào Render | Endpoint |
| --- | --- | --- | --- |
| Gemiwall | Placement ID và postback token/secret | `GEMIWALL_PLACEMENT_ID`, `GEMIWALL_POSTBACK_SECRET` | `/api/postback/gemiwall` |
| Revtoo | API key/placement key và postback secret | `REVTOO_API_KEY` hoặc `REVTOO_PLACEMENT_ID`, `REVTOO_POSTBACK_SECRET` | `/api/postback/revtoo` |
| Clickwall | Placement ID và postback token/secret | `CLICKWALL_PLACEMENT_ID`, `CLICKWALL_POSTBACK_SECRET` | `/api/postback/clickwall` |
| Moustache Leads | Placement ID, API key nếu dashboard yêu cầu, và postback secret | `MOUSTACHE_PLACEMENT_ID`, `MOUSTACHE_API_KEY`, `MOUSTACHE_POSTBACK_SECRET` | `/api/postback/moustache` |
| Taskwall | App ID và token/password dùng để xác thực callback | `TASKWALL_APP_ID`, `TASKWALL_POSTBACK_SECRET` | `/api/postback/taskwall` |
| CoinToMedia | Public/site key và postback secret | `COINTO_PUBLIC_KEY` hoặc `COINTO_PLACEMENT_ID`, `COINTO_POSTBACK_SECRET` | `/api/postback/cointo` |
| Klink Finance | Publisher ID và postback secret | `KLINK_PUBLISHER_ID`, `KLINK_POSTBACK_SECRET` | `/api/postback/klink` |
| AdsWedMedia | Public/site key và postback secret | `ADSWEDMEDIA_PUBLIC_KEY` hoặc `ADSWEDMEDIA_PLACEMENT_ID`, `ADSWEDMEDIA_POSTBACK_SECRET` | `/api/postback/adswedmedia` |
| AdMaxFlow | Placement ID và postback secret | `ADMAXFLOW_PLACEMENT_ID`, `ADMAXFLOW_POSTBACK_SECRET` | `/api/postback/admaxflow` |
| Gaintwall | Placement API key/placement key; postback secret nếu provider cấp riêng | `GAINTWALL_API_KEY` hoặc `GAINTWALL_PLACEMENT_KEY`, tùy chọn `GAINTWALL_POSTBACK_SECRET` | `/api/postback/gaintwall` |
| BucksWall | Offerwall URL/placement URL và postback secret | `BUCKSWALL_OFFERWALL_URL`, `BUCKSWALL_POSTBACK_SECRET` | `/api/postback/buckswall` |

## Taskwall: cấu hình và test

Trong Taskwall, sử dụng link được tạo từ Admin Panel. Link có dạng:

```text
https://rewardsverse.online/api/postback/taskwall?token=TASKWALL_TOKEN&userid={userid}&user_amount={user_amount}&offer_name={offer_name}&offer_id={offer_id}&payout={payout}&password={password}&app_name={app_name}&date={date}
```

`TASKWALL_TOKEN` phải là token thật được lưu trong Render dưới `TASKWALL_POSTBACK_SECRET`. Các phần nằm trong dấu `{}` là macro để Taskwall thay bằng dữ liệu conversion. Khi test, dùng username đã tồn tại trên RewardsVerse, nhập một số dương cho `user_amount` hoặc `payout`, và đổi `offer_id` mỗi lần để tránh duplicate protection.

Taskwall báo “sent successfully” chỉ có nghĩa request đã được gửi. Cần kiểm tra balance, lịch sử earning và Render Logs để xác nhận server đã tìm thấy user và ghi credit.

## Quy trình chung

1. Đăng nhập publisher dashboard của provider.
2. Tạo hoặc mở offerwall placement đang hoạt động.
3. Lấy đúng placement/app/publisher/public key theo bảng trên.
4. Mở phần postback/conversion tracking và lấy secret/token; không gửi secret qua chat.
5. Vào Render → `rewardsverse` → **Environment** → **Edit**.
6. Điền đúng tên biến, không thêm dấu ngoặc kép và không có khoảng trắng thừa.
7. Lưu thay đổi, chờ deploy hoàn tất.
8. Đăng nhập Admin Panel → **Postbacks**, kiểm tra provider chuyển sang `Configured`.
9. Dùng test conversion của provider với một username thật.
10. Kiểm tra Admin Panel → **Postbacks/Tracking** và Wallet của user.

## Xử lý lỗi

| Log hoặc triệu chứng | Ý nghĩa và cách xử lý |
| --- | --- |
| `Provider secret is not configured` | Tên biến chưa có hoặc đang để trống trong Render. |
| `Token mismatch` | Secret trong Render không trùng token provider đang gửi; kiểm tra lại hoặc tạo token mới. |
| `Missing or invalid reward amount` | Provider không gửi trường số tiền; kiểm tra `user_amount`, `payout`, `reward` hoặc mapping trong dashboard provider. |
| `No user found` | Giá trị user ID không trùng username/openId của user RewardsVerse. |
| `DUPLICATE` | Payload đã được xử lý; dùng conversion/offer ID mới khi test. |
| Taskwall báo thành công nhưng balance không đổi | Xem Render Logs; thông báo của Taskwall không phải là xác nhận RewardsVerse đã credit. |

## Biến nền tảng bắt buộc

Ngoài provider variables, production cần `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `NODE_ENV`, `PUBLIC_APP_URL` và `ADMIN_SECRET`. Các giá trị này cũng phải được lưu trong Render Environment Variables.

## Bảo mật

Không commit API key, token, postback secret, password hoặc link callback chứa secret vào GitHub, ảnh chụp công khai hay tin nhắn. Nếu secret đã bị lộ, hãy rotate/revoke secret trong publisher dashboard rồi cập nhật Render.

## References

[1]: https://rewardsverse.online/ "RewardsVerse production site"
[2]: https://dashboard.render.com/ "Render Dashboard"
[3]: https://github.com/jockmmo1998-ops/rewardsverse "RewardsVerse source repository"

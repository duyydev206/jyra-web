# Phân Tích Chuyên Sâu về Cơ Chế Zoom và Hiển Thị Timeline

## 1. Độ Rộng Timeline (Timeline Width) Tăng Gần Như Tuyến Tính Theo Zoom

**Quan sát:** Khi `zoomValue` tăng từng nấc, `timelineWidth` tăng gần như một lượng cố định.

**Dữ liệu đo đạc:**

- **Video Dài (Khoảng 3 phút 33 giây):**
    - `zoom 1` → `1949px`
    - `zoom 2` → `5362px` (Tăng: `3413px`)
    - `zoom 3` → `8776.38px` (Tăng: `3414.38px`)
    - `zoom 4` → `12190.1px` (Tăng: `3413.72px`)
    - ...
    - `zoom 10` → `32672px`

- **Video Ngắn (Khoảng 31.23 giây):**
    - `zoom 1` → `1949px`
    - `zoom 2` → `2524.7px` (Tăng: `575.7px`)
    - `zoom 3` → `3100.4px` (Tăng: `575.7px`)
    - ...
    - `zoom 10` → `7130.3px`

**Kết luận:**

- `timelineWidth` tăng gần như tuyến tính với `zoomValue`.
- Độ tăng mỗi bước (`deltaWidth`) phụ thuộc vào **duration** của timeline/video. Video dài hơn có độ tăng `deltaWidth` lớn hơn.

---

## 2. Zoom 1 Bị Clamp Về Một Độ Rộng Tối Thiểu (`minTimelineWidth`)

**Quan sát:** Ngay cả khi video ngắn hoặc timeline trống, `zoom 1` luôn cho ra một độ rộng nhất định.

**Dữ liệu đo đạc:**

- Timeline trống: `1949px`
- Video ngắn (zoom 1): `1949px`
- Video dài (zoom 1): `1949px`

**Kết luận:**
Tồn tại một quy tắc mạnh mẽ:
`timelineWidth = max(minTimelineWidth, computedWidth)`
với `minTimelineWidth ≈ 1949px`.
Điều này đảm bảo timeline luôn có độ rộng tối thiểu để người dùng nhìn và thao tác.

---

## 3. Độ Rộng Tick (Tick Width) Không Cố Định

**Quan sát:** Nhìn ban đầu có thể tưởng `tickWidth` (độ rộng của mỗi đơn vị thời gian trên ruler) cố định (ví dụ: 1 giây/tick hoặc 1 frame/tick), nhưng dữ liệu đo lại cho thấy điều ngược lại.

**Dữ liệu đo đạc (Video 31.23 giây):**

- `zoom 1` → `tickWidth` khoảng `241.688px`
- `zoom 2` → `tickWidth` khoảng `314.194px`
- `zoom 3` → `tickWidth` khoảng `386.7px`
- ...
- `zoom 6` → `tickWidth` khoảng `604.219px`
- **"Reset" tại `zoom 7`**:
    - `zoom 7` → `tickWidth` khoảng `135.345px`
    - `zoom 8` → `tickWidth` khoảng `149.846px`
    - `zoom 9` → `tickWidth` khoảng `164.348px`
    - `zoom 10` → `tickWidth` khoảng `178.849px`

**Kết luận:**

- `tickSpacing` (khoảng cách giữa các tick) thay đổi và không giữ một đơn vị cố định.
- Nó đổi theo các "mốc step" khác nhau.

---

## 4. Ruler Sử Dụng "Step" Động, Không Phải Cố Định

**Quan sát:** Ruler (thước đo thời gian) chọn các "major step" (khoảng thời gian lớn nhất hiển thị) một cách động để các tick luôn "vừa mắt" người dùng.

**Ví dụ các step có thể đổi:**
Thay vì luôn là 1 giây hoặc 1 frame, nó có thể đổi giữa:

- 24 giây
- 8 giây
- 4 giây
- 2 giây
- 1 giây
- 0.8 giây
- 0.4 giây
- ... tùy thuộc vào `zoomValue` và `duration`.

---

## 5. Quy Luật Rất Có Khả Năng Dựa Trên Frame (Frame-Based)

**Lập luận:**

- Editor được đồng bộ với Remotion, mà Remotion hoạt động dựa trên frame.
- Do đó, hệ thống hiển thị của ruler và timeline phải dựa trên frame làm gốc.

**Công thức tư duy hợp lý:**

1.  Tính `pixelsPerFrame` (số pixel cho mỗi frame).
2.  Chọn `stepFrames` (số frame trong một major step) từ một danh sách các step "đẹp".
3.  Render ruler labels dựa trên `stepFrames` đã chọn.

**Công thức tính `tickWidthPx`:**
`tickWidthPx = stepFrames * pixelsPerFrame`

Mục tiêu là chọn `stepFrames` sao cho `tickWidthPx` nằm trong khoảng nhìn đẹp (thường là từ vài chục đến vài trăm pixel).

---

## 6. Với Timeline Dài, Ruler Có Xu Hướng Đi Qua Các Step Lớn

**Quan sát (Video 3 phút 33 giây):**

- `zoom thấp` → `step` gần `24s`
- `zoom vừa` → `step` gần `8s`
- `zoom cao hơn` → `step` gần `4s`

---

## 7. Với Timeline Ngắn, Ruler Sẽ Nhảy Sang Step Nhỏ Hơn Sớm Hơn

**Quan sát (Video 31.23 giây):**

- `zoom thấp/vừa` → Ruler giữ khoảng `step ≈ 4s`.
- `zoom cao` → Ruler nhảy xuống khoảng `step ≈ 0.8s`.

**Lưu ý:** `0.8s` là một con số đáng chú ý. Nếu `fps = 30`, thì `0.8s = 24 frames`. Điều này củng cố thêm niềm tin rằng logic gắn liền với frame.

---

## 8. Quy Luật Tổng Quát Đã Chốt

**Rule Tư Duy:**

- **Width Timeline (`timelineWidth`):**
  `timelineWidth = max(MIN_TIMELINE_WIDTH, totalFrames * pixelsPerFrame)`

- **Tick Width (`tickWidthPx`):**
  `tickWidthPx = selectedStepFrames * pixelsPerFrame`

- **Lựa Chọn Step (`Step Selection`):**
  `selectedStepFrames` được chọn từ một danh sách các step "đẹp" (ví dụ: `fps * 24`, `fps * 8`, `fps * 4`, `fps * 2`, `fps`, `round(fps * 0.8)`, `round(fps * 0.4)`, ...).

---

## 9. Zoom Không Làm Đổi Dữ Liệu Clip

**Rule Quan Trọng:**
Zoom chỉ thay đổi **cách hiển thị**, không thay đổi **dữ liệu thời gian thực tế** của clip.

- **Zoom Thay Đổi:**
    - `pixelsPerFrame`
    - `timelineWidth`
    - `tick spacing`
    - Vị trí và chiều rộng của item trên UI.

- **Zoom KHÔNG Thay Đổi:**
    - `clip.from` (thời điểm bắt đầu của clip)
    - `clip.durationInFrames` (tổng số frame của clip)
    - `currentFrame` (khung hình hiện tại của playhead)

---

## 10. Item và Ruler Phải Cùng Dùng Một Hệ Quy Đổi

**Nguyên tắc thống nhất:**
Nếu ruler dùng một công thức tính toán (ví dụ: `pixelsPerFrame`, `origin`), thì các item (clip, marker,...) cũng phải sử dụng **chính xác** các thông số đó để đảm bảo sự đồng bộ.

- **Các thông số cần thống nhất:**
    - `pixelsPerFrame`
    - `gutterX` (khoảng cách giữa các item)
    - `origin` (điểm gốc của trục thời gian)
    - `frameToPx` (hàm chuyển đổi từ frame sang pixel)

---

## 11. Timeline Trống Cũng Có "Default Duration" Nhìn Thấy

**Quan sát:**

- Timeline trống không nên hiển thị hoàn toàn trắng trơn.
- Nó cần có một khoảng thời gian mặc định để người dùng bắt đầu thao tác.
- Việc `zoom 1` luôn cho `width ≈ 1949px` cho thấy đây là trạng thái mặc định của "empty visible state".

---

## 12. Các Điểm Chưa Chắc Chắn 100% (Nhưng Quy Luật Mạnh)

Mặc dù các quy luật trên đã được chốt dựa trên bộ số đo đạc, có thể có các yếu tố phụ trợ trong engine gốc:

- Làm tròn (`rounding`)
- Giới hạn viewport (`viewport clamp`)
- Ngưỡng tối thiểu/tối đa cho `ruler spacing` (`min/max ruler spacing`)
- Quy tắc thay đổi `step` theo ngưỡng cụ thể.

**Kết quả đạt được:**

- Hiểu rõ **quy luật kiến trúc** của timeline editor.
- Có một **mô hình gần đúng rất mạnh** về cách hoạt động.
- Có thể triển khai chức năng zoom timeline với độ chính xác cao, mặc dù có thể không clone **tuyệt đối từng số thập phân**.

---

## 13. Tóm Tắt Ngắn Nhất Các Quy Luật Đã Chốt

- **Zoom:** Làm `timelineWidth` tăng gần tuyến tính.
- **`zoom 1`:** Bị clamp về `minTimelineWidth ≈ 1949px`.
- **Tick Spacing:** Không cố định, thay đổi theo zoom và duration.
- **Ruler Steps:** Chọn `stepFrames` động (frame-based logic).
- **Đồng bộ:** `pixelsPerFrame`, `origin`, `frameToPx` phải được dùng chung cho ruler và items.
- **Dữ liệu Clip:** Zoom chỉ thay đổi cách hiển thị, không thay đổi dữ liệu thời gian của clip.

---

Dựa trên các quy luật này, chúng ta có thể tiếp tục xây dựng một "spec zoom timeline" ngắn gọn để làm nền tảng khi sửa đổi `TimelineToolbar` và `TimelineRuler`.

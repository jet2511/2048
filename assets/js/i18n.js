export const translations = {
    en: {
        gameIntro: 'Join the numbers and get to the <strong>2048 tile!</strong>',
        undo: 'Undo',
        newGame: 'New Game',
        keepGoing: 'Keep going',
        tryAgain: 'Try again',
        howToPlay: '<strong class="important">How to play:</strong> Use your <strong>arrow keys</strong> to move the tiles. When two tiles with the same number touch, they <strong>merge into one!</strong>',
        top5: 'Top 5 High Scores',
        close: 'Close',
        saveLoad: 'Save / Load Game',
        slotEmpty: 'Slot {0}: Empty',
        slotScore: 'Slot {0}: Score {1} ({2})',
        save: 'Save',
        load: 'Load',
        settings: 'Settings',
        language: 'Language:',
        mode: 'Mode:',
        gridSize: 'Grid Size:',
        skin: 'Skin:',
        theme: 'Theme:',
        classic: 'Classic',
        timeAttack: 'Time Attack',
        survival: 'Survival',
        numbers: 'Numbers',
        emoji: 'Emoji',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        gameWon: 'You win!',
        gameOver: 'Game over!',
        noRecords: 'No records yet.',
        scoreTitle: 'SCORE',
        bestTitle: 'BEST',
        confirmSizeChange: 'Current progress will be lost when changing grid size. Are you sure you want to continue?',
        confirmModeChange: 'Current progress will be lost when changing game mode. Continue?',
        cancel: 'Cancel',
        continueBtn: 'Continue'
    },
    vi: {
        gameIntro: 'Kết hợp các con số để tạo ra <strong>ô 2048!</strong>',
        undo: 'Hoàn tác',
        newGame: 'Chơi lại',
        keepGoing: 'Chơi tiếp',
        tryAgain: 'Thử lại',
        howToPlay: '<strong class="important">Cách chơi:</strong> Dùng <strong>các phím mũi tên</strong> để di chuyển các ô. Khi hai ô cùng số chạm nhau, chúng sẽ <strong>gộp lại thành một!</strong>',
        top5: 'Top 5 Kỷ lục',
        close: 'Đóng',
        saveLoad: 'Lưu / Tải Game',
        slotEmpty: 'Khe {0}: Trống',
        slotScore: 'Khe {0}: {1} điểm ({2})',
        save: 'Lưu',
        load: 'Tải',
        settings: 'Cài đặt',
        language: 'Ngôn ngữ:',
        mode: 'Chế độ:',
        gridSize: 'Kích cỡ:',
        skin: 'Giao diện:',
        theme: 'Chủ đề:',
        classic: 'Cổ điển',
        timeAttack: 'Thời gian',
        survival: 'Sinh tồn',
        numbers: 'Số',
        emoji: 'Biểu tượng',
        darkMode: 'Nền tối',
        lightMode: 'Nền sáng',
        gameWon: 'Bạn đã thắng!',
        gameOver: 'Kết thúc!',
        noRecords: 'Chưa có kỷ lục nào.',
        scoreTitle: 'ĐIỂM',
        bestTitle: 'KỶ LỤC',
        confirmSizeChange: 'Dữ liệu hiện tại sẽ bị mất khi bạn đổi kích thước màn chơi. Bạn có chắc chắn muốn tiếp tục?',
        confirmModeChange: 'Dữ liệu hiện tại sẽ bị mất khi đổi chế độ chơi. Tiếp tục?',
        cancel: 'Hủy',
        continueBtn: 'Tiếp tục'
    }
};

export function t(key, lang = 'vi', ...args) {
    const dict = translations[lang] || translations['en'];
    let text = dict[key] || translations['en'][key] || key;
    
    // Thay thế các biến {0}, {1}, v.v.
    if (args.length > 0) {
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });
    }
    
    return text;
}

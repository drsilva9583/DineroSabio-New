export function getLessonCountColor(count: number): string {
    if (count <= 2) {
        return 'bg-easygreen';
    }
    if (count <= 4) {
        return 'bg-mediumyellow';
    }
    return 'bg-hardred';
}

export function getTimeColor(minutes: number): string {
    if (minutes <= 15) {
        return 'bg-easygreen';
    }
    if (minutes <= 45) {
        return 'bg-mediumyellow';
    }
    return 'bg-hardred';
}

export function getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
        case 'beginner':
            return 'bg-easygreen';
        case 'intermediate':
            return 'bg-mediumyellow';
        case 'advanced':
            return 'bg-hardred';
        default:
            return 'bg-gray-200';
    }
}
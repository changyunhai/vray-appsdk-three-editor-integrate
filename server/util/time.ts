/**
 * 
 * @returns get the seconds of current time
 */
export function systemTime(): number {
    var n = new Date();
    return n.getSeconds() * 1 +
        n.getMinutes() * 100 +
        n.getHours() * 10000 +
        n.getDate() * 10000 * 100 +
        (n.getMonth() + 1) * 10000 * 10000 +
        n.getFullYear() * 10000 * 10000 * 100;
}
export function systemMonth(): number {
    var n = new Date();
    return (n.getMonth() + 1) +
        n.getFullYear() * 100;
}

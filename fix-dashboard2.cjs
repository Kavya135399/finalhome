const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');

let content = fs.readFileSync(p, 'utf8');

const correctSegment = `      toast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelTarget(null);
    }
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    toast('All notifications marked as read', 'success');
  };`;

// The broken code is currently:
//       toast('Booking cancelled successfully', 'success');
//     } catch (err: any) {
// 
//   const addAddress = () => {

// Wait, the diff block showed it removed EVERYTHING between:
//     } catch (err: any) {
// AND
//   const addAddress = () => {
// Let's find it.
const brokenIndexStart = content.indexOf('    } catch (err: any) {\n\n  const addAddress = () => {');
if (brokenIndexStart !== -1) {
  content = content.replace('    } catch (err: any) {\n\n  const addAddress = () => {', '    } catch (err: any) {\n' + correctSegment + '\n\n  const addAddress = () => {');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed file');
} else {
  console.log('Broken segment not found exactly. Falling back to regex.');
  content = content.replace(/} catch \(err: any\) \{[\s\S]*?const addAddress = \(\) => \{/, '} catch (err: any) {\n' + correctSegment + '\n\n  const addAddress = () => {');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed file using regex');
}

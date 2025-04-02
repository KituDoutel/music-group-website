import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const SocialShare = ({ url, title, track }) => {
  const shareText = `Listen to "${track.title}" by ${track.artist} on our platform! ${url}`;

  return (
    <div className="flex space-x-2">
      <FacebookShareButton url={url} quote={shareText}>
        <FaFacebook className="text-blue-600 text-2xl" />
      </FacebookShareButton>
      
      <TwitterShareButton url={url} title={shareText}>
        <FaTwitter className="text-blue-400 text-2xl" />
      </TwitterShareButton>
      
      <WhatsappShareButton url={url} title={shareText}>
        <FaWhatsapp className="text-green-500 text-2xl" />
      </WhatsappShareButton>
    </div>
  );
};